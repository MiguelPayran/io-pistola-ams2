
export class Receiving
{
    id: string;
    poNumber: string;
    stagingLocation: string;
    cartonId: string;
    licensePlate: string;
    item: string;
    isDone: boolean;
    step: number;

    /**
     * Constructor
     *
     * @param receiving
     */
    constructor(receiving?)
    {
        receiving = receiving || {};
        this.isDone = receiving.isDone || false;
        this.poNumber = receiving.poNumber || '';
        this.stagingLocation = receiving.stagingLocation || '';
        this.licensePlate = receiving.licensePlate || '';
        this.cartonId = receiving.cartonId || '';
        this.step = receiving.step || 1;
    }
}
