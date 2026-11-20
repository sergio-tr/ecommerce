import {
  Body,
  Catch,
  Controller,
  ExceptionFilter,
  Get,
  HttpCode,
  HttpException,
  Param,
  Patch,
  Post,
  UseFilters,
  type ArgumentsHost,
} from '@nestjs/common';
import {
  InMemorySyntheticCatalog,
  isCatalogError,
  readCreateBody,
  readUpdateBody,
  statusFor,
  type CatalogErrorBody,
  type SyntheticEntry,
  type SyntheticEntryList,
} from './synthetic-catalog';

export class SyntheticCatalogHttpException extends HttpException {
  constructor(body: CatalogErrorBody) {
    super({ code: body.code, reason: body.reason }, statusFor(body.code));
  }
}

@Catch(SyntheticCatalogHttpException)
export class SyntheticCatalogExceptionFilter implements ExceptionFilter {
  catch(exception: SyntheticCatalogHttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status(code: number): { json(body: unknown): void };
    }>();
    response.status(exception.getStatus()).json(exception.getResponse());
  }
}

@Controller('catalog/synthetic-entries')
@UseFilters(SyntheticCatalogExceptionFilter)
export class SyntheticCatalogController {
  private readonly catalog: InMemorySyntheticCatalog;

  constructor(catalog: InMemorySyntheticCatalog) {
    this.catalog = catalog;
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: unknown): SyntheticEntry {
    const parsed = readCreateBody(body);
    if (isCatalogError(parsed)) {
      throw new SyntheticCatalogHttpException(parsed);
    }
    return unwrap(this.catalog.create(parsed.productId, parsed.syntheticLabel));
  }

  @Get()
  list(): SyntheticEntryList {
    return this.catalog.list();
  }

  @Get(':productId')
  get(@Param('productId') productId: string): SyntheticEntry {
    return unwrap(this.catalog.get(productId));
  }

  @Patch(':productId')
  @HttpCode(200)
  update(@Param('productId') productId: string, @Body() body: unknown): SyntheticEntry {
    const parsed = readUpdateBody(body);
    if (isCatalogError(parsed)) {
      throw new SyntheticCatalogHttpException(parsed);
    }
    return unwrap(this.catalog.update(productId, parsed.syntheticLabel, parsed.expectedRevision));
  }
}

function unwrap(result: SyntheticEntry | CatalogErrorBody): SyntheticEntry {
  if (isCatalogError(result)) {
    throw new SyntheticCatalogHttpException(result);
  }
  return result;
}
