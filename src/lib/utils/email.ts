export const extractEmailAddress = (from: string): string => {
  return from.split('<')[1]?.replace('>', '') || '';
};

export const copyEmailContent = (content: string): string => {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = content;
  return tempElement.textContent || tempElement.innerText || "";
}; 