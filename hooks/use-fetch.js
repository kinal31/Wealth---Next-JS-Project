import { useState } from "react";
import { toast } from "sonner";

const useFetch = (cb) => {
    const [data, setData] = useState(undefined);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);

    const fn = async ({ ...args }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cb({ ...args });
            setData(response);
            setError(null);
        } catch (error) {
            setError(error);
            toast.error(error.message);
            setLoading(false)
        }
        finally {
            setLoading(false);
        }
    }

    return { data, error, loading, fn, setData };
}

export default useFetch;