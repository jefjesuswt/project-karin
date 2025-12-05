import { Controller, Get, Post, Body } from "@project-karin/core";
import { UsersService } from "./users.service";
import type { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Post()
    async create(@Body() body: CreateUserDto) {
        return this.usersService.create(body);
    }
}
