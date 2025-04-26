 export interface PaginationResponse<T> {
   data: T[];
   metadata: {
     totalCount: number;
   };
 }
