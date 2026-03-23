import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GetReportDto } from './dto/get-report.dto';
import { GetReportsQueryDto } from './dto/get-reports.dto';
import { ReportType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(userId: number, dto: CreateReportDto): Promise<GetReportDto> {
    const report = await this.prisma.report.create({
      data: {
        type: dto.type,
        title: dto.title,
        content: dto.content,
        userId,
      },
    });

    return new GetReportDto({
      id: report.id,
      type: report.type,
      title: report.title,
      content: report.content,
      createdAt: report.createdAt,
    });
  }

  async getMyReports(userId: number, query: GetReportsQueryDto): Promise<GetReportDto[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { type } = query;

    const where: { userId: number; type?: ReportType } = { userId };
    if (type) where.type = type;

    const reports = await this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return reports.map(
      (report) =>
        new GetReportDto({
          id: report.id,
          type: report.type,
          title: report.title,
          content: report.content,
          createdAt: report.createdAt,
        }),
    );
  }
}
