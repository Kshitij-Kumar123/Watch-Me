export const fetchQuote = async () => {
  const response = await fetch(`${process.env.REACT_APP_URL_DEV}/quotes`);
  const quotesResponse = await response.json();
  return quotesResponse;
};
