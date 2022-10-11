export class Audit {
    type: string;
    location: string;
    lps: AuditLP[];
}

export class AuditLP {
    LP: string | null;
    items: AuditItems[];
}

export class AuditItems {
    upc: string;
    scannedQuantity: number;
    actualQuantity: number;
    weight: number;
}

