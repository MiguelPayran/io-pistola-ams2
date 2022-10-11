export class Adjust {
    clientId: number;
    whId: string = '01';
    sourceLocation: string;
    employeeId: string;
    transactionCode: string;
    transactionDescription: string;
    transactionControlNumber: string;
    sourceLPType: string = 'IV';
    destinationLPType: string = 'IV';
    sourceLP: string;
    destinationLocation: string;
    destinationLP: string;
    lotNumber: string = null;
    sourceType: number = 0;
    destinationType: number = 0;
    itemNumber: string;
    quantity: number;
}
