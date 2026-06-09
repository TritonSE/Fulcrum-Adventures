export type Subscriber = {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type EmailsListResponse = {
  emails: Subscriber[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
