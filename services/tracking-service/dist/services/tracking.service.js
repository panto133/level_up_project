"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tracking_entity_1 = require("../entities/tracking.entity");
let TrackingService = class TrackingService {
    constructor(trackingRepository) {
        this.trackingRepository = trackingRepository;
    }
    async findAll(page = 1, limit = 50) {
        const [data, total] = await Promise.all([
            this.trackingRepository.find({
                skip: (page - 1) * limit,
                take: limit,
                order: {
                    createdAt: 'DESC'
                }
            }),
            this.trackingRepository.count()
        ]);
        return {
            data,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            itemsPerPage: limit
        };
    }
    async findOne(id) {
        return this.trackingRepository.findOne({ where: { id } });
    }
};
exports.TrackingService = TrackingService;
exports.TrackingService = TrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_entity_1.TrackingRecord)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TrackingService);
//# sourceMappingURL=tracking.service.js.map