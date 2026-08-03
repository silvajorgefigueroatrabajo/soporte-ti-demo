<?php

namespace App\Http\Controllers;

use App\Models\Center;
use App\Models\Driver;
use App\Models\Guide;
use App\Models\SupportCase;
use App\Models\SupportOption;
use App\Models\User;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\DefinedName;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Table;
use PhpOffice\PhpSpreadsheet\Worksheet\Table\TableStyle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadSupportCasesController extends Controller
{
    private const CASE_HEADERS = ['Fecha', 'Día', 'Hora reporte', 'Hora resuelto', 'Turno', 'Técnico', 'Centro', 'Comunicador', 'Conductor', 'Tipo', 'Descripción', 'Estado', 'Observaciones', 'Transporte'];

    private const FUTURE_INPUT_ROWS = 5000;

    public function __invoke(): StreamedResponse
    {
        $cases = SupportCase::query()->with('user:id,name')->orderBy('reported_date')->orderBy('reported_time')->get();
        $spreadsheet = $this->buildWorkbook($cases);
        $filename = 'respaldo-soporte-ti-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->setIncludeCharts(true);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }

    public function buildWorkbook(Collection $cases): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $spreadsheet->getProperties()
            ->setCreator('Nexo Soporte')
            ->setTitle('Plan de continuidad de Nexo Soporte')
            ->setSubject('Casos, catálogos y conocimiento operativo')
            ->setDescription('Respaldo portable y editable sin credenciales ni imágenes');
        $spreadsheet->getDefaultStyle()->getFont()->setName('Aptos')->setSize(10);

        $options = $this->options($cases);
        $centers = Center::query()->orderBy('name')->get();
        $drivers = Driver::query()->orderBy('center_name')->orderBy('name')->get();
        $guides = Guide::query()->with('user:id,name')->orderBy('category')->orderBy('title')->get();

        $start = $spreadsheet->getActiveSheet();
        $start->setTitle('Inicio');
        $dashboard = $spreadsheet->createSheet()->setTitle('Dashboard');
        $caseSheet = $spreadsheet->createSheet()->setTitle('Casos');
        $centerSheet = $spreadsheet->createSheet()->setTitle('Centros');
        $driverSheet = $spreadsheet->createSheet()->setTitle('Conductores');
        $guideSheet = $spreadsheet->createSheet()->setTitle('Guías');
        $parameterSheet = $spreadsheet->createSheet()->setTitle('Parámetros');

        $this->fillStartSheet($start, $cases, $centers, $drivers, $guides);
        $this->fillCasesSheet($caseSheet, $cases);
        $this->fillParametersSheet($spreadsheet, $parameterSheet, $options);
        $this->fillCentersSheet($centerSheet, $centers);
        $this->fillDriversSheet($driverSheet, $drivers);
        $this->fillGuidesSheet($guideSheet, $guides);
        $this->fillDashboard($dashboard, $options, $cases);

        $spreadsheet->setActiveSheetIndex(0);

        return $spreadsheet;
    }

    private function fillStartSheet(Worksheet $sheet, Collection $cases, Collection $centers, Collection $drivers, Collection $guides): void
    {
        $sheet->setShowGridlines(false);
        $sheet->mergeCells('A1:H2')->setCellValue('A1', 'PLAN DE CONTINUIDAD · SOPORTE TI');
        $sheet->getStyle('A1:H2')->applyFromArray($this->titleStyle());
        $sheet->getRowDimension(1)->setRowHeight(28);

        $sheet->setCellValue('A4', 'Objetivo');
        $sheet->mergeCells('A5:H6')->setCellValue('A5', 'Este archivo permite consultar el historial y continuar registrando casos manualmente si la aplicación deja de estar disponible. Trabaja siempre sobre una copia y agrega los casos en la primera fila vacía de la tabla de la hoja Casos.');
        $sheet->getStyle('A5:H6')->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);

        $sheet->fromArray([
            ['Contenido', 'Registros', 'Uso'],
            ['Casos', $cases->count(), 'Historial completo y tabla editable'],
            ['Centros', $centers->count(), 'Directorio operacional'],
            ['Conductores', $drivers->count(), 'Directorio sin contraseñas'],
            ['Guías', $guides->count(), 'Procedimientos en texto, sin capturas'],
        ], null, 'A8');
        $sheet->setCellValue('B9', $cases->count())
            ->setCellValue('B10', $centers->count())
            ->setCellValue('B11', $drivers->count())
            ->setCellValue('B12', $guides->count());
        $sheet->getStyle('A8:C8')->applyFromArray($this->headerStyle());
        $sheet->getStyle('A8:C12')->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_HAIR)->getColor()->setARGB('FFD9E2EC');

        $sheet->setCellValue('E8', 'Cómo continuar en Excel');
        $sheet->fromArray([
            ['1', 'Abre Casos y escribe en la fila inmediatamente debajo de la tabla.'],
            ['2', 'Usa las listas desplegables; puedes ampliarlas en Parámetros.'],
            ['3', 'Filtra por fecha, centro, estado o tipo desde los encabezados.'],
            ['4', 'El Dashboard se actualiza al abrir/recalcular el archivo.'],
            ['5', 'Guarda copias periódicas con fecha en el nombre.'],
        ], null, 'E9');
        $sheet->getStyle('E8:H8')->applyFromArray($this->headerStyle());
        $sheet->mergeCells('E8:H8');
        foreach (range(9, 13) as $row) {
            $sheet->mergeCells("F{$row}:H{$row}");
        }
        $sheet->getStyle('E9:H13')->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);

        $sheet->setCellValue('A15', 'Seguridad y peso del archivo');
        $sheet->mergeCells('A16:H18')->setCellValue('A16', 'No se exportan contraseñas, cuentas de acceso, bitácora ni capturas de las guías. Esto evita exponer información sensible y mantiene el respaldo liviano. El transporte se conserva solo dentro de cada caso porque es un dato único, no un catálogo reutilizable.');
        $sheet->getStyle('A16:H18')->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);

        $sheet->setCellValue('A20', 'Generado')->setCellValue('B20', now()->format('d/m/Y H:i'));
        $sheet->setCellValue('A21', 'Cobertura')->setCellValue('B21', $cases->isEmpty() ? 'Sin casos' : $cases->min('reported_date')->format('d/m/Y').' al '.$cases->max('reported_date')->format('d/m/Y'));
        $sheet->getStyle('A4:A4')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A15:A15')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A20:A21')->getFont()->setBold(true);
        foreach (['A' => 18, 'B' => 18, 'C' => 40, 'D' => 4, 'E' => 6, 'F' => 22, 'G' => 22, 'H' => 22] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
        $sheet->freezePane('A4');
    }

    private function fillCasesSheet(Worksheet $sheet, Collection $cases): void
    {
        $sheet->fromArray(self::CASE_HEADERS, null, 'A1');
        $sheet->setShowGridlines(false);
        $sheet->freezePane('A2');
        $sheet->getStyle('A1:N1')->applyFromArray($this->headerStyle());
        $sheet->getRowDimension(1)->setRowHeight(28);

        $row = 2;
        foreach ($cases as $case) {
            $sheet->setCellValue("A{$row}", Date::PHPToExcel($case->reported_date));
            $sheet->setCellValue("B{$row}", $this->weekdayFormula($row));
            if ($case->reported_time) {
                $sheet->setCellValue("C{$row}", $this->timeValue($case->reported_time));
            }
            if ($case->resolved_time) {
                $sheet->setCellValue("D{$row}", $this->timeValue($case->resolved_time));
            }
            $sheet->fromArray([
                $case->shift,
                $case->user?->name ?: $case->technician,
                $case->center,
                $case->reporter,
                $case->driver,
                $case->case_type,
                $case->description,
                $case->status,
                $case->observations,
                $case->transport,
            ], null, "E{$row}");
            $row++;
        }

        if ($row === 2) {
            $sheet->setCellValue('B2', $this->weekdayFormula(2));
            $row++;
        }
        $lastRow = $row - 1;
        $table = new Table("A1:N{$lastRow}", 'CasosTable');
        $table->setStyle((new TableStyle)->setTheme(TableStyle::TABLE_STYLE_MEDIUM2)->setShowRowStripes(true));
        $sheet->addTable($table);

        $sheet->getStyle("A2:A{$lastRow}")->getNumberFormat()->setFormatCode('dd/mm/yyyy');
        $sheet->getStyle("C2:D{$lastRow}")->getNumberFormat()->setFormatCode('hh:mm');
        $sheet->getStyle("K2:M{$lastRow}")->getAlignment()->setWrapText(true);
        $sheet->getStyle("A2:N{$lastRow}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
        $sheet->getStyle("A2:N{$lastRow}")->getBorders()->getBottom()->setBorderStyle(Border::BORDER_HAIR)->getColor()->setARGB('FFD9E2EC');

        $this->addValidation($sheet, 'E2:E'.self::FUTURE_INPUT_ROWS, 'TurnosLista');
        $this->addValidation($sheet, 'F2:F'.self::FUTURE_INPUT_ROWS, 'TecnicosLista');
        $this->addValidation($sheet, 'G2:G'.self::FUTURE_INPUT_ROWS, 'CentrosLista');
        $this->addValidation($sheet, 'H2:H'.self::FUTURE_INPUT_ROWS, 'ComunicadoresLista');
        $this->addValidation($sheet, 'I2:I'.self::FUTURE_INPUT_ROWS, 'ConductoresLista');
        $this->addValidation($sheet, 'J2:J'.self::FUTURE_INPUT_ROWS, 'TiposLista');
        $this->addValidation($sheet, 'L2:L'.self::FUTURE_INPUT_ROWS, 'EstadosLista');

        foreach (['A' => 13, 'B' => 13, 'C' => 13, 'D' => 14, 'E' => 10, 'F' => 20, 'G' => 20, 'H' => 27, 'I' => 27, 'J' => 18, 'K' => 42, 'L' => 16, 'M' => 62, 'N' => 15] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
        $sheet->getPageSetup()->setRowsToRepeatAtTopByStartAndEnd(1, 1)->setOrientation('landscape')->setFitToWidth(1)->setFitToHeight(0);
    }

    private function fillDashboard(Worksheet $sheet, array $options, Collection $cases): void
    {
        $sheet->setShowGridlines(false);
        $sheet->mergeCells('A1:L2')->setCellValue('A1', 'DASHBOARD SOPORTE TI');
        $sheet->getStyle('A1:L2')->applyFromArray($this->titleStyle());
        $sheet->mergeCells('A3:L3')->setCellValue('A3', 'Resumen general del respaldo. Usa los filtros de la hoja Casos para análisis específicos.');
        $sheet->getStyle('A3:L3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $cards = [
            ['A5:B5', 'A6:B7', 'Casos totales', '=COUNT(Casos!A2:A5000)', 'FFDDEBF7'],
            ['D5:E5', 'D6:E7', 'Resueltos', '=COUNTIF(Casos!L2:L5000,"Resuelto")', 'FFE2F0D9'],
            ['G5:H5', 'G6:H7', 'Escalados', '=COUNTIF(Casos!L2:L5000,"Escalado")', 'FFFCE4D6'],
            ['J5:K5', 'J6:K7', 'Sin respuesta', '=COUNTIF(Casos!L2:L5000,"Sin Respuesta")', 'FFE7E6E6'],
        ];
        foreach ($cards as [$titleRange, $valueRange, $title, $formula, $color]) {
            $sheet->mergeCells($titleRange)->mergeCells($valueRange);
            $sheet->getCell(explode(':', $titleRange)[0])->setValue($title);
            $sheet->getCell(explode(':', $valueRange)[0])->setValue($formula);
            $sheet->getStyle($titleRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($color);
            $sheet->getStyle($titleRange)->getFont()->setBold(true);
            $sheet->getStyle($titleRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle($valueRange)->getFont()->setBold(true)->setSize(18);
            $sheet->getStyle($valueRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
        }

        $statuses = collect($options['statuses']);
        $types = collect($options['case_types'])->sortByDesc(fn (string $type) => $cases->where('case_type', $type)->count())->values();
        $sheet->fromArray([['Estado', 'Cantidad']], null, 'A10');
        foreach ($statuses as $index => $status) {
            $row = 11 + $index;
            $sheet->setCellValue("A{$row}", $status)->setCellValue("B{$row}", "=COUNTIF(Casos!L2:L5000,A{$row})");
        }
        $sheet->fromArray([['Tipo', 'Cantidad']], null, 'D10');
        foreach ($types as $index => $type) {
            $row = 11 + $index;
            $sheet->setCellValue("D{$row}", $type)->setCellValue("E{$row}", "=COUNTIF(Casos!J2:J5000,D{$row})");
        }
        $sheet->getStyle('A10:B10')->applyFromArray($this->headerStyle());
        $sheet->getStyle('D10:E10')->applyFromArray($this->headerStyle());
        $sheet->setCellValue('G10', 'Nota')->setCellValue('G11', 'Los tipos con cantidad 0 se mantienen visibles para conservar el catálogo completo.');
        $sheet->mergeCells('G10:L10')->mergeCells('G11:L12');
        $sheet->getStyle('G10:L10')->applyFromArray($this->headerStyle());
        $sheet->getStyle('G11:L12')->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);

        $statusLast = 10 + max(1, $statuses->count());
        $this->addDashboardChart($sheet, 'StatusChart', 'Casos por estado', "A11:A{$statusLast}", "B11:B{$statusLast}", DataSeries::TYPE_DONUTCHART, 'A17', 'F33');
        if ($types->isNotEmpty()) {
            $typeChartCount = min(12, $types->count());
            $typeLast = 10 + $typeChartCount;
            $this->addDashboardChart($sheet, 'TypeChart', 'Incidencias por tipo', "D11:D{$typeLast}", "E11:E{$typeLast}", DataSeries::TYPE_BARCHART, 'G17', 'L33', DataSeries::DIRECTION_BAR);
        }

        foreach (range('A', 'L') as $column) {
            $sheet->getColumnDimension($column)->setWidth(14);
        }
        $sheet->getColumnDimension('D')->setWidth(22);
        $sheet->freezePane('A5');
    }

    private function fillParametersSheet(Spreadsheet $spreadsheet, Worksheet $sheet, array $options): void
    {
        $columns = [
            'A' => ['Técnicos', 'technicians', 'TecnicosLista'],
            'B' => ['Turnos', 'shifts', 'TurnosLista'],
            'C' => ['Tipos', 'case_types', 'TiposLista'],
            'D' => ['Estados', 'statuses', 'EstadosLista'],
            'E' => ['Comunicadores', 'reporters', 'ComunicadoresLista'],
            'F' => ['Conductores', 'drivers', 'ConductoresLista'],
            'G' => ['Centros', 'centers', 'CentrosLista'],
        ];
        foreach ($columns as $column => [$title, $key, $definedName]) {
            $values = collect($options[$key])->filter()->unique()->values();
            $sheet->setCellValue("{$column}1", $title);
            if ($values->isNotEmpty()) {
                $sheet->fromArray($values->map(fn ($value) => [$value])->all(), null, "{$column}2");
            }
            $last = max(2, $values->count() + 1);
            $spreadsheet->addDefinedName(DefinedName::createInstance($definedName, $sheet, "'Parámetros'!\${$column}\$2:\${$column}\${$last}"));
            $sheet->getColumnDimension($column)->setWidth(in_array($column, ['E', 'F'], true) ? 34 : 22);
        }
        $sheet->getStyle('A1:G1')->applyFromArray($this->headerStyle());
        $sheet->setCellValue('I2', 'Puedes agregar valores al final de cada columna. Para ampliar una lista desplegable, actualiza su rango en Fórmulas > Administrador de nombres.');
        $sheet->setCellValue('I4', 'Transporte no aparece aquí: cada número pertenece a un caso y no se reutiliza como catálogo.');
        $sheet->mergeCells('I2:L3')->mergeCells('I4:L5');
        $sheet->getStyle('I2:L5')->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
        foreach (range('I', 'L') as $column) {
            $sheet->getColumnDimension($column)->setWidth(18);
        }
        $sheet->freezePane('A2');
        $sheet->setShowGridlines(false);
    }

    private function fillCentersSheet(Worksheet $sheet, Collection $centers): void
    {
        $headers = ['Código', 'Nombre', 'Tipo', 'Responsable', 'Focal Point', 'Terminales POS', 'Go Live'];
        $sheet->fromArray($headers, null, 'A1');
        $row = 2;
        foreach ($centers as $center) {
            $sheet->fromArray([$center->code, $center->name, $center->type, $center->responsible, $center->focal_point, $center->pos_status], null, "A{$row}");
            if ($center->go_live_date) {
                $sheet->setCellValue("G{$row}", Date::PHPToExcel($center->go_live_date));
            }
            $row++;
        }
        $this->finishDirectorySheet($sheet, 'A', 'G', max(2, $row - 1), 'CentrosTable');
        $sheet->getStyle('G2:G'.max(2, $row - 1))->getNumberFormat()->setFormatCode('dd/mm/yyyy');
        foreach (['A' => 12, 'B' => 24, 'C' => 22, 'D' => 28, 'E' => 28, 'F' => 14, 'G' => 14] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    private function fillDriversSheet(Worksheet $sheet, Collection $drivers): void
    {
        $headers = ['Código centro', 'Centro', 'Conductor', 'Serie POS', 'Tipo chip', 'Código SAP', 'RUT', 'Usuario', 'Email', 'Empresa', 'Usuario BTP', 'Observaciones', 'Fecha solicitud', 'Go Live'];
        $sheet->fromArray($headers, null, 'A1');
        $row = 2;
        foreach ($drivers as $driver) {
            $sheet->fromArray([
                $driver->center_code, $driver->center_name, $driver->name, $driver->pos_serial, $driver->chip_type,
                $driver->sap_code, $driver->rut, $driver->username, $driver->email, $driver->company,
                $driver->btp_user, $driver->observations, $driver->request_date, $driver->go_live,
            ], null, "A{$row}");
            $row++;
        }
        $this->finishDirectorySheet($sheet, 'A', 'N', max(2, $row - 1), 'ConductoresTable');
        foreach (['A' => 14, 'B' => 24, 'C' => 34, 'D' => 18, 'E' => 14, 'F' => 15, 'G' => 16, 'H' => 24, 'I' => 30, 'J' => 22, 'K' => 16, 'L' => 42, 'M' => 16, 'N' => 16] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
        $sheet->getStyle('L2:L'.max(2, $row - 1))->getAlignment()->setWrapText(true);
    }

    private function fillGuidesSheet(Worksheet $sheet, Collection $guides): void
    {
        $headers = ['Título', 'Categoría', 'Resumen', 'Procedimiento', 'Autor', 'Actualizada'];
        $sheet->fromArray($headers, null, 'A1');
        $row = 2;
        foreach ($guides as $guide) {
            $sheet->fromArray([$guide->title, $guide->category, $guide->summary, $guide->content, $guide->user?->name], null, "A{$row}");
            $sheet->setCellValue("F{$row}", Date::PHPToExcel($guide->updated_at));
            $row++;
        }
        $lastRow = max(2, $row - 1);
        $this->finishDirectorySheet($sheet, 'A', 'F', $lastRow, 'GuiasTable');
        $sheet->getStyle("F2:F{$lastRow}")->getNumberFormat()->setFormatCode('dd/mm/yyyy hh:mm');
        $sheet->getStyle("C2:D{$lastRow}")->getAlignment()->setWrapText(true)->setVertical(Alignment::VERTICAL_TOP);
        foreach (['A' => 35, 'B' => 22, 'C' => 42, 'D' => 85, 'E' => 24, 'F' => 20] as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
    }

    private function finishDirectorySheet(Worksheet $sheet, string $firstColumn, string $lastColumn, int $lastRow, string $tableName): void
    {
        $sheet->setShowGridlines(false);
        $sheet->freezePane('A2');
        if ($lastRow === 2 && $sheet->getCell('A2')->getValue() === null) {
            $sheet->setCellValue('A2', '');
        }
        $table = new Table("{$firstColumn}1:{$lastColumn}{$lastRow}", $tableName);
        $table->setStyle((new TableStyle)->setTheme(TableStyle::TABLE_STYLE_MEDIUM4)->setShowRowStripes(true));
        $sheet->addTable($table);
        $sheet->getStyle("{$firstColumn}1:{$lastColumn}1")->applyFromArray($this->headerStyle());
        $sheet->getStyle("{$firstColumn}2:{$lastColumn}{$lastRow}")->getAlignment()->setVertical(Alignment::VERTICAL_TOP);
    }

    private function addDashboardChart(Worksheet $sheet, string $name, string $title, string $labels, string $values, string $type, string $topLeft, string $bottomRight, ?string $direction = null): void
    {
        $startRow = (int) preg_replace('/\D/', '', explode(':', $labels)[0]);
        $endRow = (int) preg_replace('/\D/', '', explode(':', $labels)[1]);
        $count = $endRow - $startRow + 1;
        $labelSeries = new DataSeriesValues('String', "'Dashboard'!{$labels}", null, $count);
        $valueSeries = new DataSeriesValues('Number', "'Dashboard'!{$values}", null, $count);
        $grouping = $type === DataSeries::TYPE_DONUTCHART ? null : DataSeries::GROUPING_CLUSTERED;
        $series = new DataSeries($type, $grouping, range(0, max(0, $count - 1)), [], [$labelSeries], [$valueSeries]);
        if ($direction !== null) {
            $series->setPlotDirection($direction);
        }
        $legend = $type === DataSeries::TYPE_DONUTCHART ? new Legend(Legend::POSITION_BOTTOM) : null;
        $chart = new Chart($name, new Title($title), $legend, new PlotArea(null, [$series]));
        $chart->setTopLeftPosition($topLeft)->setBottomRightPosition($bottomRight);
        $sheet->addChart($chart);
    }

    private function addValidation(Worksheet $sheet, string $range, string $definedName): void
    {
        $validation = new DataValidation;
        $validation->setType(DataValidation::TYPE_LIST)
            ->setErrorStyle(DataValidation::STYLE_STOP)
            ->setAllowBlank(true)
            ->setShowDropDown(true)
            ->setShowErrorMessage(true)
            ->setErrorTitle('Valor no válido')
            ->setError('Selecciona un valor disponible en la hoja Parámetros.')
            ->setFormula1("={$definedName}")
            ->setSqref($range);
        $sheet->getCell(explode(':', $range)[0])->setDataValidation($validation);
    }

    private function options(Collection $cases): array
    {
        $dynamic = SupportOption::query()->where('active', true)->orderBy('name')->get()->groupBy('category');
        $merge = fn (array $configured, Collection $recorded): array => collect($configured)->merge($recorded)->filter()->unique()->values()->all();

        return [
            'technicians' => $merge(User::query()->where('role', 'technician')->orderBy('name')->pluck('name')->all(), $cases->map(fn (SupportCase $case) => $case->user?->name ?: $case->technician)),
            'shifts' => $merge(config('support.shifts'), $cases->pluck('shift')),
            'case_types' => $merge($dynamic->get('case_type', collect())->pluck('name')->all(), $cases->pluck('case_type')),
            'statuses' => $merge(config('support.statuses'), $cases->pluck('status')),
            'reporters' => $merge($dynamic->get('reporter', collect())->pluck('name')->all(), $cases->pluck('reporter')),
            'drivers' => $merge(Driver::query()->orderBy('name')->pluck('name')->all(), $cases->pluck('driver')),
            'centers' => $merge(Center::query()->orderBy('name')->pluck('name')->all(), $cases->pluck('center')),
        ];
    }

    private function timeValue(string $time): float
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time));

        return ($hours * 3600 + $minutes * 60) / 86400;
    }

    private function weekdayFormula(int $row): string
    {
        return "=IF(A{$row}=\"\",\"\",CHOOSE(WEEKDAY(A{$row},2),\"lunes\",\"martes\",\"miércoles\",\"jueves\",\"viernes\",\"sábado\",\"domingo\"))";
    }

    private function headerStyle(): array
    {
        return [
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF166534']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
    }

    private function titleStyle(): array
    {
        return [
            'font' => ['bold' => true, 'size' => 17, 'color' => ['argb' => 'FFFFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF0F172A']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
    }
}
