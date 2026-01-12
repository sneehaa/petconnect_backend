import axios from "axios";

export const initiateKhalti = async (payload) => {
  const response = await axios.post(
    process.env.KHALTI_INIT_URL,
    payload,
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
    }
  );
  return response.data;
};

export const verifyKhalti = async (pidx) => {
  const response = await axios.post(
    process.env.KHALTI_VERIFY_URL,
    { pidx },
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
    }
  );
  return response.data;
};
