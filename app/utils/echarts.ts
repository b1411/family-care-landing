import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  HeatmapChart,
  GaugeChart,
  FunnelChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkAreaComponent,
  MarkPointComponent,
  VisualMapComponent,
  CalendarComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

let registered = false

export async function getEcharts() {
  if (!registered) {
    echarts.use([
      BarChart,
      LineChart,
      PieChart,
      HeatmapChart,
      GaugeChart,
      FunnelChart,
      GridComponent,
      TooltipComponent,
      LegendComponent,
      TitleComponent,
      DataZoomComponent,
      MarkLineComponent,
      MarkAreaComponent,
      MarkPointComponent,
      VisualMapComponent,
      CalendarComponent,
      CanvasRenderer,
    ])
    registered = true
  }
  return echarts
}
