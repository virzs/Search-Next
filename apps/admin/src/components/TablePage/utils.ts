import { format, isValid, parseISO } from "date-fns";

export const renderEmptyToBarre = (value: any) => {
  if (value instanceof Array) {
    if (value.length === 0) {
      return "-";
    }
    return value;
  } else if (value instanceof Object) {
    if (value?.name || value?.username) {
      return value.name || value?.username;
    }
  } else if (["", null, undefined].includes(value)) {
    return "-";
  }
  try {
    const isDate = isValid(parseISO(value));
    return isDate ? format(parseISO(value), "yyyy-MM-dd HH:mm:ss") : value;
  } catch (e) {
    return value;
  }
};
