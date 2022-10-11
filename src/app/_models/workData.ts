export class WorkData {
    workQId: string;
    pickId: number;
    workType: string;
    waveType: string;
    orderNumber: string;
    customerType: string;
    totes: any[];
    action: string;
    itemNumber: string;
    priority: string;
    displayItemNumber: string;
    items?: string[];
    plannedQuantity: number;
    maxPlannedQuantity: number;
    sourceLocation: string;
    details: any;
    sourceLP: string;
    destinationCart: string;
    destinationLocation: string;
    destinationLP: string;
    pickedQuantity: number;
    stagingLocation: string;
    adCode: string;
    clientId: string;

    constructor(workData?) {
        workData = workData || {};
        this.workQId = workData.workQId || null;
        this.pickId = workData.pickId || null;
        this.workType = workData.workType || null;
        this.waveType = workData.waveType || null;
        this.orderNumber = workData.orderNumber || null;
        this.priority = workData.priority || null;
        this.action = workData.action || null;
        this.customerType = workData.customerType || null;
        this.itemNumber = workData.itemNumber || null;
        this.totes = workData.totes || null;
        this.displayItemNumber = workData.displayItemNumber || null;
        this.plannedQuantity = workData.plannedQuantity || 0;
        this.maxPlannedQuantity = workData.maxPlannedQuantity || 0;
        this.sourceLocation = workData.sourceLocation || null;
        this.sourceLP = workData.sourceLP || null;
        this.destinationCart = workData.destinationCart || null;
        this.destinationLocation = workData.destinationLocation || null;
        this.destinationLP = workData.destinationLP || null;
        this.pickedQuantity = workData.pickedQuantity || null;
        this.stagingLocation = workData.stagingLocation || null;
        this.adCode = workData.adCode || null;
        this.clientId = workData.clientId || null;
    }
}
