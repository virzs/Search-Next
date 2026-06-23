export class Response {
  static page(data: any, query: any) {
    const { page = 1, pageSize = 10, total = 0 } = query;

    return {
      data,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  static success() {
    return {
      success: true,
    };
  }
}
