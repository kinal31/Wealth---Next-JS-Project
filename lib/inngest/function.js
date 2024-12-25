import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlert = inngest.createFunction(
    { name: "Check budget alert" },
    { cron: "0 */6 * * *" },
    async ({ step }) => {
        const budgets = await step.run("fetch-budget", async () => {
            return await db.budget.findMany({
                include: {
                    user: {
                        include: {
                            accounts: {
                                where: {
                                    isDefault: true
                                },
                            },
                        },
                    },
                },
            })
        })

        for (const budget of budgets) {
            const defaultAccount = budget.user.accounts[0];
            if (!defaultAccount) continue; // skip if no default account

            await step.run(`check-budget-${budget.id}`, async () => {
                const currentDate = new Date();
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                const expenses = await db.transaction.aggregate({
                    where: {
                        userId: budget.userId,
                        accountId: defaultAccount.id, // only consider default account
                        type: "EXPENSE",
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth,
                        },
                    },
                    _sum: {
                        amount: true,
                    },
                });

                const totalExpenses = expenses._sum.amount?.toNumber() || 0;
                const budgetAmount = budget.amount;
                const percentageUsed = (totalExpenses / budgetAmount) * 100;

                console.log(percentageUsed);

                // (!(null/undefiend -> false) || if the current month is different from the month when the last alert was sent.)
                if (percentageUsed >= 80 && (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) {   // &&(previously sent the mail || is it a new month)
                    // Send Email
                    console.log(budget.user.email);

                    await sendEmail({
                        to: budget.user.email,
                        subject: `Budget Alert for ${defaultAccount.name}`,
                        react: EmailTemplate({
                            userName: budget.user.name,
                            type: "budget-alert",
                            data: {
                                percentageUsed,
                                budgetAmount: parseInt(budgetAmount).toFixed(1),
                                totalExpenses: parseInt(totalExpenses).toFixed(1),
                                accountName: defaultAccount.name,
                            },
                        }),
                    });

                    // update lastAlertSent
                    await db.budget.update({
                        where: {
                            id: budget.id,
                        },
                        data: {
                            lastAlertSent: new Date(),
                        }
                    });
                }

            })
        }
    },
);

function isNewMonth(lastAlertDate, currentDate) {
    return (
        lastAlertDate.getFullYear() !== currentDate.getFullYear() ||
        lastAlertDate.getMonth() !== currentDate.getMonth()
    )
}

export const triggerRequrringTransactions = inngest.createFunction(
    {
        id: "trigger-recurring-transactions", // Unique ID,
        name: "trigger recurring transactions",
    },
    { cron: "0 0 * * *" }, // Daily at midnight


    async({step}) =>{
        //1. fetch all recurring transactions
        const recurringTransactions = await step.run(
            "trigger-recurring-transactions",
            async() =>{
                return await db.transaction.findMany({
                    where:{
                        isRecurring : true,
                        status:"COMPLETED",
                        OR:[
                            {lastProcessed : null}, // never processed
                            { nextReccuringDate :{ lte: new Date()} } //due date passed
                        ]
                    }
                });
            }
        )
    }

   
)