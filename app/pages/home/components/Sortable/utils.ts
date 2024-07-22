class SortableUtils {
  public static uniqueArray = (array: any[]) =>
    array.reduce((acc, current) => {
      const x = acc.find((item: any) => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
}

export default SortableUtils;
