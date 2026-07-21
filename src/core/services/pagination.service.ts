import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationMeta } from '../interfaces/pagination-meta.interface';

@Injectable()
export class PaginationService {
  calculateOffset(limit: number, page: number) {
    return (page - 1) * limit;
  }

  createMeta(limit: number, page: number, count: number): PaginationMeta {
    const totalPages = Math.ceil(count / limit);
    if (totalPages > 0 && page > totalPages) {
      throw new BadRequestException(
        `La página ${page} no existe. Total de páginas: ${totalPages}.`,
      );
    }

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      itemsPerPage: limit,
      totalItems: count,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }
}
