export interface WalletBalanceData {
  Balance_Amount?: number;
  Updated_On?: string;
  currentBalance?: number;
  lastUpdatedDate?: string;
  [key: string]: any;
}

export interface WalletBalanceResponse {
  success?: boolean;
  data?: WalletBalanceData;
  Balance_Amount?: number;
  Updated_On?: string;
  [key: string]: any;
}

export interface WalletHistoryItem {
  id?: string;
  Transaction_Date?: string;
  date?: string;
  Date?: string;
  Merchant?: string;
  merchant?: string;
  merchantName?: string;
  Amount?: number;
  amount?: number;
  Remarks?: string;
  remarks?: string;
  Category?: string;
  category?: string;
  Subsidy_Type?: string;
  subsidyType?: string;
  SubsidyType?: string;
  [key: string]: any;
}

export interface WalletCategory {
  Wallet_Category_ID?: number | string;
  categoryId?: number | string;
  Category_Name?: string;
  categoryName?: string;
  [key: string]: any;
}

export interface ShopDetails {
  Shop_Code?: string;
  shopId?: string | number;
  Merchant_Name?: string;
  shopName?: string;
  Category?: string;
  category?: string;
  Location?: string;
  location?: string;
  Default_Amount?: number;
  amount?: number;
  [key: string]: any;
}

export interface UpdateWalletPayload {
  Wallet_Transaction_ID?: number;
  StaffID: number;
  Transaction_Date?: string;
  Shop_Code: string;
  Amount: number;
  Remarks?: string;
  User_ID?: number;
  Wallet_Category_ID?: number | string;
  Subsidy_Type_ID?: number | string;
  [key: string]: any;
}

export interface GetWalletHistoryPayload {
  StaffID: number;
  HistoryDate?: string;
}
