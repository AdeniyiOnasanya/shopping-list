export type Item = {
  id: number;
  name: string;
  price_pence: number;
  is_purchased: boolean;
};

export type NewItem = {
  name: string;
  price_pence: number;
};

export type ValidationErrors = Record<string, string[]>;

export type Paginated<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type ItemsPage = Paginated<Item> & {
  counts: {
    to_find: number;
    in_trolley: number;
  };
};
