class Structure {
    constructor(type, id, boundingBox) {
        this.type = type;
        this.id = id;
        this.boundingBox = boundingBox;

        // For description generation
        this.qualPosition = "";
        this.features = [];
        this.substructures = [];
        this.colors = [];
    }
}