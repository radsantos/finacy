export const formatDate = (
  dateString: string | number | null | undefined,
): string => {
  if (!dateString) return "Data não informada";

  try {
    let date: Date;

    if (typeof dateString === "string") {
      // Para datas no formato ISO (YYYY-MM-DDTHH:MM:SS)
      if (dateString.includes("T")) {
        const [year, month, day] = dateString.split("T")[0].split("-");
        return `${day}/${month}/${year.slice(-2)}`;
      }

      // Para datas no formato YYYY-MM-DD
      if (dateString.includes("-")) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year.slice(-2)}`;
      }

      date = new Date(dateString);
    } else if (typeof dateString === "number") {
      date = new Date(dateString);
    } else {
      return "Data inválida";
    }

    if (isNaN(date.getTime())) return "Data inválida";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  } catch {
    return "Data inválida";
  }
};
