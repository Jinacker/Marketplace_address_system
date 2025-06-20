"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Store,
  X,
  Navigation,
  Settings,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react"

interface Booth {
  id: number
  name?: string
  description?: string
  address?: string
  isRegistered: boolean
  x: number
  y: number
  row: number
  col: number
  status?: "pending" | "approved" | "rejected"
  submittedAt?: string
  views?: number
  popularity?: number
}

const initialBooths: Booth[] = [
  // Row 1 (상단)
  {
    id: 1,
    name: "홍길동상점",
    description: "수제 액세서리와 빈티지 소품을 판매합니다.",
    address: "연수플리마켓-홍길동상점",
    isRegistered: true,
    x: 35,
    y: 35,
    row: 1,
    col: 1,
    status: "approved",
    submittedAt: "2024-06-15",
    views: 245,
    popularity: 8.5,
  },
  {
    id: 2,
    name: "달콤카페",
    description: "직접 로스팅한 원두와 수제 디저트를 제공합니다.",
    address: "연수플리마켓-달콤카페",
    isRegistered: true,
    x: 50,
    y: 35,
    row: 1,
    col: 2,
    status: "approved",
    submittedAt: "2024-06-16",
    views: 189,
    popularity: 7.2,
  },
  {
    id: 3,
    name: "그린플랜트",
    description: "공기정화 식물과 예쁜 화분을 판매합니다.",
    address: "연수플리마켓-그린플랜트",
    isRegistered: true,
    x: 65,
    y: 35,
    row: 1,
    col: 3,
    status: "approved",
    submittedAt: "2024-06-17",
    views: 156,
    popularity: 6.8,
  },

  // Row 2 (중간)
  {
    id: 4,
    isRegistered: false,
    x: 35,
    y: 50,
    row: 2,
    col: 1,
    status: "pending",
    submittedAt: "2024-06-18",
    views: 0,
    popularity: 0,
  },
  {
    id: 5,
    isRegistered: false,
    x: 50,
    y: 50,
    row: 2,
    col: 2,
    status: "pending",
    submittedAt: "2024-06-19",
    views: 0,
    popularity: 0,
  },
  {
    id: 6,
    isRegistered: false,
    x: 65,
    y: 50,
    row: 2,
    col: 3,
    status: "pending",
    submittedAt: "2024-06-20",
    views: 0,
    popularity: 0,
  },

  // Row 3 (하단)
  { id: 7, isRegistered: false, x: 35, y: 65, row: 3, col: 1, views: 0, popularity: 0 },
  { id: 8, isRegistered: false, x: 50, y: 65, row: 3, col: 2, views: 0, popularity: 0 },
  { id: 9, isRegistered: false, x: 65, y: 65, row: 3, col: 3, views: 0, popularity: 0 },
]

export default function FleaMarketPrototype() {
  const [currentPage, setCurrentPage] = useState<"main" | "admin">("main")
  const [zoomLevel, setZoomLevel] = useState<"city" | "park">("city")
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null)
  const [booths, setBooths] = useState<Booth[]>(initialBooths)
  const [registrationForm, setRegistrationForm] = useState({ name: "", description: "" })

  const handleMarkerClick = () => {
    setZoomLevel("park")
  }

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth)
  }

  const handleBoothRegistration = (boothId: number) => {
    if (!registrationForm.name.trim()) return

    const updatedBooths = booths.map((booth) =>
      booth.id === boothId
        ? {
            ...booth,
            name: registrationForm.name,
            description: registrationForm.description,
            address: `연수플리마켓-${registrationForm.name}`,
            isRegistered: true,
            status: "pending" as const,
            submittedAt: new Date().toISOString().split("T")[0],
          }
        : booth,
    )

    setBooths(updatedBooths)
    setRegistrationForm({ name: "", description: "" })
    setSelectedBooth(null)
  }

  const handleBackToCity = () => {
    setSelectedBooth(null)
    setZoomLevel("city")
  }

  const handleStatusChange = (boothId: number, newStatus: "approved" | "rejected") => {
    const updatedBooths = booths.map((booth) =>
      booth.id === boothId ? { ...booth, status: newStatus, isRegistered: newStatus === "approved" } : booth,
    )
    setBooths(updatedBooths)
  }

  // 팝업 위치 계산 함수
  const getPopupPosition = (booth: Booth) => {
    let popupX = booth.x
    let popupY = booth.y
    let arrowDirection = "left"

    if (booth.x < 70) {
      popupX = booth.x + 12
      arrowDirection = "left"
    } else {
      popupX = booth.x - 12
      arrowDirection = "right"
    }

    if (booth.y < 30) {
      popupY = booth.y + 5
    } else if (booth.y > 70) {
      popupY = booth.y - 5
    }

    return { x: popupX, y: popupY, arrowDirection }
  }

  // 통계 계산
  const stats = {
    totalBooths: booths.length,
    registeredBooths: booths.filter((b) => b.isRegistered).length,
    pendingBooths: booths.filter((b) => b.status === "pending").length,
    totalViews: booths.reduce((sum, b) => sum + (b.views || 0), 0),
    avgPopularity:
      booths.filter((b) => b.popularity).reduce((sum, b) => sum + (b.popularity || 0), 0) /
        booths.filter((b) => b.popularity).length || 0,
  }

  if (currentPage === "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-slate-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6" />
                <div>
                  <h1 className="text-xl font-bold">플리마켓 관리자 시스템</h1>
                  <p className="text-sm text-gray-300">연수플리마켓 백오피스</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setCurrentPage("main")}>
                사용자 페이지로 돌아가기
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 mb-32">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                대시보드
              </TabsTrigger>
              <TabsTrigger value="booths" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                부스 관리
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                일정 관리
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                통계 분석
              </TabsTrigger>
            </TabsList>

            {/* 대시보드 */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">전체 부스</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBooths}</div>
                    <p className="text-xs text-muted-foreground">총 부스 수</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">등록된 부스</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.registeredBooths}</div>
                    <p className="text-xs text-muted-foreground">승인 완료</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">대기 중</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingBooths}</div>
                    <p className="text-xs text-muted-foreground">승인 대기</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
                    <Eye className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalViews}</div>
                    <p className="text-xs text-muted-foreground">누적 조회</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>최근 부스 등록</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {booths
                        .filter((b) => b.submittedAt)
                        .slice(0, 5)
                        .map((booth) => (
                          <div key={booth.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{booth.name || `부스 ${booth.id}`}</div>
                              <div className="text-sm text-gray-500">{booth.submittedAt}</div>
                            </div>
                            <Badge
                              variant={
                                booth.status === "approved"
                                  ? "default"
                                  : booth.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {booth.status === "approved" ? "승인" : booth.status === "pending" ? "대기" : "반려"}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>인기 부스 TOP 5</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {booths
                        .filter((b) => b.popularity)
                        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                        .slice(0, 5)
                        .map((booth, index) => (
                          <div key={booth.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium">{booth.name}</div>
                                <div className="text-sm text-gray-500">{booth.views} 조회</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">{booth.popularity?.toFixed(1)}</div>
                              <div className="text-xs text-gray-500">인기도</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 부스 관리 */}
            <TabsContent value="booths" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>부스 승인 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>부스 ID</TableHead>
                        <TableHead>상점명</TableHead>
                        <TableHead>위치</TableHead>
                        <TableHead>신청일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>조회수</TableHead>
                        <TableHead>관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booths.map((booth) => (
                        <TableRow key={booth.id}>
                          <TableCell>{booth.id}</TableCell>
                          <TableCell>{booth.name || "-"}</TableCell>
                          <TableCell>
                            {booth.row}열 {booth.col}번
                          </TableCell>
                          <TableCell>{booth.submittedAt || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booth.status === "approved"
                                  ? "default"
                                  : booth.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {booth.status === "approved"
                                ? "승인"
                                : booth.status === "pending"
                                  ? "대기"
                                  : booth.status === "rejected"
                                    ? "반려"
                                    : "미신청"}
                            </Badge>
                          </TableCell>
                          <TableCell>{booth.views || 0}</TableCell>
                          <TableCell>
                            {booth.status === "pending" && (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleStatusChange(booth.id, "approved")}>
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleStatusChange(booth.id, "rejected")}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 일정 관리 */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>행사 일정 관리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>행사 시작일</Label>
                      <Input type="date" defaultValue="2027-07-08" />
                    </div>
                    <div>
                      <Label>행사 종료일</Label>
                      <Input type="date" defaultValue="2027-07-09" />
                    </div>
                  </div>
                  <div>
                    <Label>주소 활성화 시간</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">행사 시작과 동시</SelectItem>
                        <SelectItem value="1day">1일 전</SelectItem>
                        <SelectItem value="3days">3일 전</SelectItem>
                        <SelectItem value="1week">1주일 전</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>주소 비활성화 시간</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">행사 종료와 동시</SelectItem>
                        <SelectItem value="1day">1일 후</SelectItem>
                        <SelectItem value="1week">1주일 후</SelectItem>
                        <SelectItem value="1month">1개월 후</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">일정 업데이트</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 통계 분석 */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>부스별 상세 통계</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>부스명</TableHead>
                          <TableHead>조회수</TableHead>
                          <TableHead>인기도</TableHead>
                          <TableHead>순위</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {booths
                          .filter((b) => b.name)
                          .sort((a, b) => (b.views || 0) - (a.views || 0))
                          .map((booth, index) => (
                            <TableRow key={booth.id}>
                              <TableCell>{booth.name}</TableCell>
                              <TableCell>{booth.views}</TableCell>
                              <TableCell>{booth.popularity?.toFixed(1)}</TableCell>
                              <TableCell>#{index + 1}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>실시간 현황</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span>평균 인기도</span>
                      <span className="font-bold text-blue-600">{stats.avgPopularity.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span>승인율</span>
                      <span className="font-bold text-green-600">
                        {((stats.registeredBooths / (stats.registeredBooths + stats.pendingBooths)) * 100 || 0).toFixed(
                          1,
                        )}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span>부스당 평균 조회수</span>
                      <span className="font-bold text-purple-600">
                        {(stats.totalViews / stats.registeredBooths || 0).toFixed(0)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">플리마켓 사물주소체계</h3>
                <p className="text-gray-300 text-sm">플리마켓 사물 주소 체계 제안을 위한 프로토타입입니다.</p>
                <p className="text-gray-400 text-xs mt-2">공간분석 4조</p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <a
                    href="https://github.com/Jinacker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    GitHub: @Jinacker
                  </a>
                </div>
                <p className="text-gray-400 text-xs">© 2024 공간분석 4조. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900">스마트 플리마켓 사물주소체계</h1>
              <p className="text-sm text-gray-600">Smart Flea Market Address System</p>
            </div>
            <Button variant="outline" onClick={() => setCurrentPage("admin")} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              관리자
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 mb-32">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="xl:col-span-3">
            <Card className="h-[600px] shadow-lg">
              <CardHeader className="bg-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5" />
                    <div>
                      <CardTitle className="text-lg">
                        {zoomLevel === "city" ? "인천광역시 연수구" : "센트럴파크 산책정원"}
                      </CardTitle>
                    </div>
                  </div>
                  {zoomLevel === "park" && (
                    <Button variant="secondary" size="sm" onClick={handleBackToCity}>
                      전체 지도
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-full pb-6 p-0">
                <div className="relative w-full h-full overflow-hidden">
                  {zoomLevel === "city" ? (
                    // City View with real map background
                    <div className="relative w-full h-full">
                      {/* Real map background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: "url('/new-map-background.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>

                      {/* Central Park Marker */}
                      <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-10"
                        onClick={handleMarkerClick}
                      >
                        {/* Pulsing effect */}
                        <div className="absolute inset-0 w-12 h-12 rounded-full opacity-30 animate-ping bg-green-500"></div>

                        {/* Main marker */}
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-xl border-3 border-white bg-green-400">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>

                        {/* Info popup */}
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-xl z-20 border">
                          <div className="font-bold text-sm text-gray-900 whitespace-nowrap">연수플리마켓</div>
                          <div className="text-xs text-green-600 text-center">D-2</div>
                          {/* Arrow */}
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t rotate-45"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Park View with clean background
                    <div className="relative w-full h-full p-6">
                      {/* Event Info - 좌상단에 추가 */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border z-10">
                        <div className="text-sm font-bold text-gray-900">연수플리마켓</div>
                        <div className="text-xs text-gray-600">2027.07.08 ~ 07.09</div>
                        <div className="text-xs text-gray-600">인천 연수구 센트럴파크</div>
                      </div>

                      {/* Clean park background */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: "url('/park-background.png')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>

                      {/* Connection line for selected booth */}
                      {selectedBooth && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                            </marker>
                          </defs>
                          <line
                            x1={`${selectedBooth.x}%`}
                            y1={`${selectedBooth.y}%`}
                            x2={`${getPopupPosition(selectedBooth).x}%`}
                            y2={`${getPopupPosition(selectedBooth).y}%`}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            markerEnd="url(#arrowhead)"
                          />
                        </svg>
                      )}

                      {/* Booths */}
                      {booths.map((booth) => (
                        <div key={booth.id}>
                          <div
                            className={`absolute cursor-pointer transition-all duration-200 ${
                              selectedBooth?.id === booth.id ? "scale-125 z-40" : "hover:scale-110 z-20"
                            }`}
                            style={{
                              left: `${booth.x}%`,
                              top: `${booth.y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                            onClick={() => handleBoothClick(booth)}
                          >
                            <div
                              className={`w-12 h-12 rounded-lg shadow-lg border-2 flex items-center justify-center ${
                                booth.isRegistered
                                  ? selectedBooth?.id === booth.id
                                    ? "bg-blue-600 border-blue-800 ring-4 ring-blue-300"
                                    : "bg-blue-500 border-blue-700"
                                  : selectedBooth?.id === booth.id
                                    ? "bg-gray-400 border-gray-600 ring-4 ring-gray-300"
                                    : "bg-gray-300 border-gray-500 border-dashed"
                              }`}
                            >
                              {booth.isRegistered ? (
                                <Store className="w-6 h-6 text-white" />
                              ) : (
                                <span className="text-xs font-bold text-gray-600">{booth.id}</span>
                              )}
                            </div>

                            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap border">
                              {booth.isRegistered ? booth.name : `부스 ${booth.id}`}
                            </div>
                          </div>

                          {/* Popup for selected booth */}
                          {selectedBooth?.id === booth.id && (
                            <div
                              className="absolute z-50"
                              style={{
                                left: `${getPopupPosition(booth).x}%`,
                                top: `${getPopupPosition(booth).y}%`,
                                transform: "translate(-50%, -50%)",
                              }}
                            >
                              <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-200 p-4 w-80 max-w-sm animate-in fade-in duration-200">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedBooth.isRegistered ? "부스 정보" : "부스 등록"}
                                  </h3>
                                  <Button variant="ghost" size="sm" onClick={() => setSelectedBooth(null)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>

                                {selectedBooth.isRegistered ? (
                                  // Registered Booth Info
                                  <div className="space-y-3">
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">사물주소</Label>
                                      <div className="mt-1 p-2 bg-blue-50 rounded border font-mono text-sm">
                                        {selectedBooth.address}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">상점명</Label>
                                      <div className="mt-1 font-medium">{selectedBooth.name}</div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">위치</Label>
                                      <div className="mt-1 text-sm text-gray-600">
                                        {selectedBooth.row}열 {selectedBooth.col}번 부스
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium text-gray-600">설명</Label>
                                      <div className="mt-1 text-sm text-gray-700">{selectedBooth.description}</div>
                                    </div>
                                  </div>
                                ) : (
                                  // Registration Form
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor="booth-name" className="text-sm font-medium">
                                        부스명 <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id="booth-name"
                                        placeholder="예: 홍길동상점"
                                        value={registrationForm.name}
                                        onChange={(e) =>
                                          setRegistrationForm((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        className="mt-1"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="booth-description" className="text-sm font-medium">
                                        설명
                                      </Label>
                                      <Textarea
                                        id="booth-description"
                                        placeholder="판매 품목이나 부스 소개를 입력하세요"
                                        value={registrationForm.description}
                                        onChange={(e) =>
                                          setRegistrationForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        className="mt-1"
                                        rows={2}
                                      />
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded border">
                                      <div className="text-xs font-medium text-gray-600 mb-1">생성될 사물주소</div>
                                      <div className="text-xs font-mono text-blue-600">
                                        연수플리마켓-{registrationForm.name || "[부스명]"}
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => handleBoothRegistration(selectedBooth.id)}
                                      disabled={!registrationForm.name.trim()}
                                      className="w-full"
                                      size="sm"
                                    >
                                      부스 등록하기
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border z-10">
                        <div className="text-xs font-semibold text-gray-700 mb-2">범례</div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>등록된 부스</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 border border-dashed border-gray-600 rounded"></div>
                            <span>빈 부스</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">사용 방법</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="outline">1</Badge>
                  <span>지도의 빨간 마커를 클릭하여 연수마켓으로 이동</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline">2</Badge>
                  <span>부스를 클릭하여 상세 정보 확인 또는 등록</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline">3</Badge>
                  <span>빈 부스에 새로운 상점을 등록해보세요</span>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {booths.filter((b) => b.isRegistered).length}
                    </div>
                    <div className="text-sm text-gray-600">등록된 부스</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-400">
                      {booths.filter((b) => !b.isRegistered).length}
                    </div>
                    <div className="text-sm text-gray-600">빈 부스</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-px">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">플리마켓 사물주소 체계 제안 </h3>
                <p className="max-w-7xl mx-auto px-6 py-26 py-2">플리마켓 사물 주소 체계 제안을 위한 프로토타입입니다.</p>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <a
                    href="https://github.com/Jinacker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    GitHub: @Jinacker
                  </a>
                </div>
                <p className="text-gray-400 text-xs">© 2025-1 공간분석 4조. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
