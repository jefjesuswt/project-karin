import { Controller, Get, Post, Body } from "@karin-js/core";
import { ProductsService } from "./products.service";
import type { CreateProductDto } from "./dto/create-product.dto";

@Controller("products")
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll() {
        return this.productsService.findAll();
    }

    @Post()
    async create(@Body() body: CreateProductDto) {
        return this.productsService.create(body);
    }
}
