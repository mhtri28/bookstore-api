import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { Role } from 'src/generated/prisma/enums';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @Auth(Role.ADMIN)
  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @Get()
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.categories(query);
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.category({ category_id: id });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category' })
  @Auth(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory({
      where: { category_id: id },
      data: updateCategoryDto,
    });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category' })
  @Auth(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory({ category_id: id });
  }
}