export interface ApplyLeavePayload {
  StaffID: number;
  LeaveTypeID: number;
  LeaveDate: string;
  FromDate: string;
  ToDate: string;
  Reason: string;
  EmergencyNo: string;
  EmergencyAddress: string;
}

export interface LeaveApplicationItem {
  id?: string | number;
  LeaveID?: string | number;
  LeaveType?: string;
  LeaveTypeName?: string;
  LeaveDate?: string;
  FromDate?: string;
  ToDate?: string;
  NoOfDays?: number;
  Reason?: string;
  Status?: string;
  AppliedDate?: string;
  [key: string]: any;
}
