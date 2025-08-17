// src/components/productUpload/modals/ThumbModal/parts/EditorSpecialTools.tsx
// ✅ 특수 기능을 가진 도구들을 관리하는 컴포넌트
// ✅ Pencil, Magic Wand, Lasso 등 다양한 도구들을 확장 가능하게 구성

import React, { useRef, useCallback, useEffect, useState } from "react";
import "@/styles/productUpload/editorSpecialTools.css";

export type ToolType = 'pencil' | 'magicWand' | 'lasso' | 'eraser';

interface ToolConfig {
  type: ToolType;
  icon: string;
  name: string;
  description: string;
  cursor: string;
}

const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  pencil: {
    type: 'pencil',
    icon: '✏️',
    name: '연필',
    description: '자유롭게 그리기',
    cursor: 'crosshair'
  },
  magicWand: {
    type: 'magicWand',
    icon: '🪄',
    name: '마법봉',
    description: '유사 색상 영역 선택',
    cursor: 'crosshair'
  },
  lasso: {
    type: 'lasso',
    icon: '🪢',
    name: '올가미',
    description: '자유로운 영역 선택',
    cursor: 'crosshair'
  },
  eraser: {
    type: 'eraser',
    icon: '🧽',
    name: '지우개',
    description: '그린 내용 지우기',
    cursor: 'crosshair'
  }
};

type Props = {
  stageRef: React.RefObject<HTMLDivElement>;
  onToolComplete?: (toolType: ToolType, data: any) => void;
  activeTool: ToolType | null;
  onToolChange: (tool: ToolType | null) => void;
};

export default function EditorSpecialTools({
  stageRef,
  onToolComplete,
  activeTool,
  onToolChange
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<Path2D[]>([]);
  const [currentPath, setCurrentPath] = useState<Path2D | null>(null);
  const [toolSettings, setToolSettings] = useState({
    lineWidth: 2,
    color: '#ffffff', // 기본 색상을 white로 설정
    opacity: 1
  });

  // 설정 박스 표시/숨김 상태 관리
  const [showSettings, setShowSettings] = useState(false);

  // Lasso 선택 영역 상태 관리
  const [lassoSelection, setLassoSelection] = useState<Path2D | null>(null);
  const [isLassoSelectionActive, setIsLassoSelectionActive] = useState(false);
  const [dashOffset, setDashOffset] = useState(0);

  // 도구별 기본 설정 적용
  useEffect(() => {
    if (activeTool) {
      // 도구 활성화 시 설정 박스 기본적으로 숨김
      setShowSettings(false);

      let defaultColor = '#ffffff'; // 기본값
      let defaultLineWidth = 2;

      switch (activeTool) {
        case 'eraser':
          defaultColor = '#ffffff'; // Eraser는 white
          defaultLineWidth = 5;
          break;
        case 'lasso':
          defaultColor = '#00ff00'; // Lasso는 green
          defaultLineWidth = 2;
          break;
        case 'pencil':
          defaultColor = '#00ff00'; // Pencil은 green
          defaultLineWidth = 2;
          break;
        case 'magicWand':
          defaultColor = '#ff00ff'; // MagicWand는 magenta
          defaultLineWidth = 1;
          break;
      }

      setToolSettings(prev => ({
        ...prev,
        color: defaultColor,
        lineWidth: defaultLineWidth
      }));
    } else {
      // 도구 비활성화 시 설정 박스도 숨김
      setShowSettings(false);

      // Lasso 선택 영역 초기화
      if (isLassoSelectionActive) {
        setLassoSelection(null);
        setIsLassoSelectionActive(false);
        setDashOffset(0);
      }
    }
  }, [activeTool, isLassoSelectionActive]);

  // Canvas 초기화 및 도구별 설정 적용
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stageRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    canvas.width = stageRect.width;
    canvas.height = stageRect.height;

    // Canvas 스타일 설정
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // toolSettings가 업데이트되기 전에 도구별 기본값 사용
      let currentColor = toolSettings.color;
      let currentLineWidth = toolSettings.lineWidth;

      if (activeTool) {
        switch (activeTool) {
          case 'eraser':
            currentColor = '#ffffff';
            currentLineWidth = 5;
            break;
          case 'lasso':
            currentColor = '#00ff00';
            currentLineWidth = 2;
            break;
          case 'pencil':
            currentColor = '#00ff00';
            currentLineWidth = 2;
            break;
          case 'magicWand':
            currentColor = '#ff00ff';
            currentLineWidth = 1;
            break;
        }
      }

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = toolSettings.opacity;

      // 도구별 그리기 모드 설정
      if (activeTool && activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else if (activeTool && activeTool === 'lasso') {
        ctx.globalCompositeOperation = 'source-over';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }, [stageRef, activeTool]); // toolSettings 의존성 제거

  // 도구별 그리기 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!activeTool || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Canvas 설정 재적용 - 도구별 기본값 사용
    const ctx = canvas.getContext('2d');
    let currentColor = toolSettings.color;
    let currentLineWidth = toolSettings.lineWidth;

    if (ctx) {
      // 도구별 기본값 즉시 적용
      if (activeTool) {
        switch (activeTool) {
          case 'eraser':
            currentColor = '#ffffff';
            currentLineWidth = 5;
            break;
          case 'lasso':
            currentColor = '#00ff00'; // Lasso는 green으로 영역 선택 표시
            currentLineWidth = 2;
            break;
          case 'pencil':
            currentColor = '#00ff00';
            currentLineWidth = 2;
            break;
          case 'magicWand':
            currentColor = '#ff00ff';
            currentLineWidth = 1;
            break;
        }
      }

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = toolSettings.opacity;

      if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else if (activeTool === 'lasso') {
        // Lasso 도구: 영역 선택을 위한 투명한 채우기
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // 반투명 초록색
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    const path = new Path2D();
    path.moveTo(x, y);

    setCurrentPath(path);
    setIsDrawing(true);

    // Eraser 도구일 때는 즉시 지우기 시작
    if (activeTool === 'eraser' && ctx) {
      ctx.beginPath();
      ctx.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [activeTool, toolSettings]);

  // 도구별 그리기 중
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!activeTool || !isDrawing || !currentPath || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentPath.lineTo(x, y);

    // Canvas에 그리기
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 도구별 기본값 즉시 적용
      let currentColor = toolSettings.color;
      let currentLineWidth = toolSettings.lineWidth;

      if (activeTool) {
        switch (activeTool) {
          case 'eraser':
            currentColor = '#ffffff';
            currentLineWidth = 5;
            break;
          case 'lasso':
            currentColor = '#00ff00';
            currentLineWidth = 2;
            break;
          case 'pencil':
            currentColor = '#00ff00';
            currentLineWidth = 2;
            break;
          case 'magicWand':
            currentColor = '#ff00ff';
            currentLineWidth = 1;
            break;
        }
      }

      // Canvas 설정 유지
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = toolSettings.opacity;

      if (activeTool && activeTool === 'eraser') {
        // Eraser 도구: 이미지 영역을 지우는 효과
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);
        ctx.fill();

        // 이미지 영역도 함께 지우기 위해 추가 처리
        const imageElement = stageRef.current?.querySelector('img');
        if (imageElement) {
          const imgRect = imageElement.getBoundingClientRect();
          const canvasRect = canvas.getBoundingClientRect();

          // 이미지 좌표를 canvas 좌표로 변환
          const imgX = x - (imgRect.left - canvasRect.left);
          const imgY = y - (imgRect.top - canvasRect.top);

          // 이미지 영역 내에서만 지우기
          if (imgX >= 0 && imgX <= imgRect.width && imgY >= 0 && imgY <= imgRect.height) {
            // 이미지 위에 투명한 원을 그려서 지우기 효과 생성
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(imgX, imgY, currentLineWidth / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // 이미지 요소 자체에도 지우기 효과 적용
            try {
              const imgCanvas = document.createElement('canvas');
              const imgCtx = imgCanvas.getContext('2d');
              if (imgCtx) {
                imgCanvas.width = imgRect.width;
                imgCanvas.height = imgRect.height;

                // 이미지를 canvas에 그리기
                imgCtx.drawImage(imageElement as HTMLImageElement, 0, 0, imgRect.width, imgRect.height);

                // 지우기 효과 적용
                imgCtx.globalCompositeOperation = 'destination-out';
                imgCtx.beginPath();
                imgCtx.arc(imgX, imgY, currentLineWidth / 2, 0, 2 * Math.PI);
                imgCtx.fill();

                // 수정된 이미지를 원본에 적용
                const newImageUrl = imgCanvas.toDataURL();
                (imageElement as HTMLImageElement).src = newImageUrl;
              }
            } catch (error) {
              // console.log('EditorSpecialTools: Eraser - 이미지 직접 수정 실패, canvas 지우기만 적용:', error);
            }
          }
        }
      } else if (activeTool && activeTool === 'lasso') {
        // Lasso 도구: 자유로운 영역 선택을 위한 선 그리기
        ctx.globalCompositeOperation = 'source-over';
        ctx.stroke(currentPath);

        // 선택된 영역을 시각적으로 표시
        if (currentPath) {
          ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
          ctx.fill(currentPath);

          // 선택된 영역의 경계를 강조
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.stroke(currentPath);
        }
      } else {
        // 일반 그리기 도구들
        ctx.globalCompositeOperation = 'source-over';
        ctx.stroke(currentPath);
      }
    }
  }, [activeTool, isDrawing, currentPath, toolSettings]);

  // 도구별 그리기 종료
  const handleMouseUp = useCallback(() => {
    if (!activeTool || !currentPath) return;

    setIsDrawing(false);

    if (currentPath) {
      // Lasso 도구일 때 선택 영역 완성
      if (activeTool === 'lasso') {
        // 선택 영역을 닫기 (시작점으로 연결)
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // 시작점으로 선 연결
            ctx.beginPath();
            ctx.moveTo(0, 0); // 시작점 (실제로는 첫 번째 점)
            ctx.lineTo(canvas.width, canvas.height); // 임시 선 (실제로는 Path2D 사용)

            // 선택 영역을 상태에 저장
            setLassoSelection(currentPath);
            setIsLassoSelectionActive(true);
            setDashOffset(0);
          }
        }
      }

      // 모든 도구의 경로를 저장 (Eraser 포함)
      setPaths(prev => [...prev, currentPath]);

      // 그린 경로를 도구별 데이터로 변환하여 viewer에 전달
      if (onToolComplete) {
        const toolData = {
          path: currentPath,
          type: activeTool,
          settings: toolSettings,
          // viewer 연동을 위한 추가 데이터
          canvasData: canvasRef.current?.toDataURL(),
          bounds: getPathBounds(currentPath),
          // 영구 저장을 위한 추가 정보
          timestamp: Date.now(),
          permanent: true
        };

        onToolComplete(activeTool, toolData);
      }
    }

    // 현재 경로만 초기화하고 도구 상태는 유지
    setCurrentPath(null);
  }, [activeTool, currentPath, onToolComplete, toolSettings]);

  // 경로의 경계 상자 계산
  const getPathBounds = useCallback((path: Path2D) => {
    // 간단한 경계 상자 계산 (실제로는 더 정확한 계산 필요)
    return {
      x: 0,
      y: 0,
      width: canvasRef.current?.width || 0,
      height: canvasRef.current?.height || 0
    };
  }, []);

  // 도구별 취소
  const handleCancel = useCallback(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      // 모든 도구의 내용을 초기화
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // 저장된 경로들을 다시 그리기
      ctx.globalCompositeOperation = 'source-over';
      paths.forEach(path => {
        ctx.stroke(path);
      });
    }

    // 그린 내용만 초기화하고 도구 상태는 유지
    setPaths([]);
    setCurrentPath(null);
    setIsDrawing(false);

    // Lasso 선택 영역도 초기화
    if (isLassoSelectionActive) {
      setLassoSelection(null);
      setIsLassoSelectionActive(false);
      setDashOffset(0);
    }
  }, [activeTool, paths, isLassoSelectionActive]);

  // 도구별 설정 변경
  const handleToolSettingChange = useCallback((setting: keyof typeof toolSettings, value: any) => {
    setToolSettings(prev => ({ ...prev, [setting]: value }));

    // 설정 변경 시 즉시 Canvas에 반영
    const canvas = canvasRef.current;
    if (canvas && activeTool) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (setting === 'lineWidth') {
          ctx.lineWidth = value;
        } else if (setting === 'color') {
          ctx.strokeStyle = value;
        } else if (setting === 'opacity') {
          ctx.globalAlpha = value;
        }
      }
    }
  }, [activeTool]);

  // 설정 박스 내부 요소 클릭 이벤트 처리
  const handleSettingClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
  }, []);

  // 그린 경로들을 다시 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 모든 도구의 경로를 다시 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 도구별 기본값 즉시 적용
    let currentColor = toolSettings.color;
    let currentLineWidth = toolSettings.lineWidth;

    if (activeTool) {
      switch (activeTool) {
        case 'eraser':
          currentColor = '#ffffff';
          currentLineWidth = 5;
          break;
        case 'lasso':
          currentColor = '#00ff00';
          currentLineWidth = 2;
          break;
        case 'pencil':
          currentColor = '#00ff00';
          currentLineWidth = 2;
          break;
        case 'magicWand':
          currentColor = '#ff00ff';
          currentLineWidth = 1;
          break;
      }
    }

    // Canvas 설정 유지
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = toolSettings.opacity;

    // 도구별 그리기 모드 설정
    if (activeTool && activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    paths.forEach(path => {
      ctx.stroke(path);
    });
  }, [paths, activeTool, toolSettings]);

  // 현재 활성화된 도구의 설정 가져오기
  const currentToolConfig = activeTool ? TOOL_CONFIGS[activeTool] : null;

  // 도구가 활성화되지 않았을 때도 렌더링 (CSS에서 pointer-events 제어)
  const dataActiveValue = activeTool ? "true" : "false";
  const cursorValue = activeTool ? currentToolConfig?.cursor || 'crosshair' : 'default';
  const pointerEventsValue = activeTool ? 'auto' : 'none';
  const isActive = !!activeTool;

  // 도구가 활성화되었을 때 선택상자 이벤트를 일시적으로 비활성화
  useEffect(() => {
    if (activeTool) {
      // 도구별 커서 설정
      if (activeTool === 'eraser') {
        // Eraser 커서 설정 - 십자가에서 eraser icon으로 변경
        document.body.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'%23000\' d=\'M15.14,3C14.63,3 14.12,3.2 13.73,3.59L2.59,14.73C2.2,15.12 2,15.63 2,16.14V21C2,21.55 2.45,22 3,22H7.86C8.37,22 8.88,21.8 9.27,21.41L20.41,10.27C20.8,9.88 21,9.37 21,8.86V4C21,3.45 20.55,3 20,3H15.14M7.86,20H4V16.14L15.14,5H18.14L7,16.14L7.86,20Z\"/></svg>") 12 12, auto';
      } else if (activeTool === 'lasso') {
        // Lasso 커서 설정 - 십자가에서 lasso icon으로 변경
        document.body.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'%23000\' d=\'M9,3A6,6 0 0,1 15,9C15,10.5 14.5,12 13.5,13L15,14.5L13.5,16L12,14.5C10.5,15.5 9,16 7.5,16A6,6 0 0,1 1.5,10A6,6 0 0,1 7.5,4C8.5,4 9.5,4.5 10.5,5.5L12,4L13.5,5.5C14.5,4.5 15.5,4 16.5,4A6,6 0 0,1 22.5,10A6,6 0 0,1 16.5,16C15,16 13.5,15.5 12,14.5L10.5,16L9,14.5L10.5,13C9.5,12 9,10.5 9,9A6,6 0 0,1 15,3Z\"/></svg>") 12 12, auto';
      } else {
        document.body.style.cursor = 'crosshair';
      }

      // 선택박스 이벤트를 완전히 비활성화
      const stage = stageRef.current;
      if (stage) {
        // 선택박스 요소들을 찾아서 이벤트를 비활성화
        const selectBoxes = stage.querySelectorAll('.select-box, .handle');
        selectBoxes.forEach((box: Element) => {
          (box as HTMLElement).style.pointerEvents = 'none';
          (box as HTMLElement).style.display = 'none'; // 완전히 숨김
        });
      }
    } else {
      document.body.style.cursor = 'default';

      // 선택박스 이벤트를 다시 활성화
      const stage = stageRef.current;
      if (stage) {
        const selectBoxes = stage.querySelectorAll('.select-box, .handle');
        selectBoxes.forEach((box: Element) => {
          (box as HTMLElement).style.pointerEvents = 'auto';
          (box as HTMLElement).style.display = ''; // 원래 상태로 복원
        });
      }
    }

    // 컴포넌트 언마운트 시 cursor 초기화
    return () => {
      document.body.style.cursor = 'default';
      const stage = stageRef.current;
      if (stage) {
        const selectBoxes = stage.querySelectorAll('.select-box, .handle');
        selectBoxes.forEach((box: Element) => {
          (box as HTMLElement).style.pointerEvents = 'auto';
          (box as HTMLElement).style.display = '';
        });
      }
    };
  }, [activeTool, stageRef]);

  // Lasso 선택 영역의 점선 깜박임 효과
  useEffect(() => {
    if (isLassoSelectionActive && lassoSelection) {
      const interval = setInterval(() => {
        setDashOffset(prev => (prev + 1) % 20);
      }, 100); // 100ms마다 깜박임

      return () => clearInterval(interval);
    }
  }, [isLassoSelectionActive, lassoSelection]);

  // Lasso 선택 영역의 점선 깜박임 효과 렌더링
  const renderLassoSelection = useCallback(() => {
    if (!isLassoSelectionActive || !lassoSelection || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 점선 효과를 위한 설정
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = dashOffset;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.globalCompositeOperation = 'source-over';

    // 선택 영역 그리기
    ctx.stroke(lassoSelection);

    // 점선 설정 초기화
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
  }, [isLassoSelectionActive, lassoSelection, dashOffset]);

  // Canvas에 점선 효과 적용
  useEffect(() => {
    if (isLassoSelectionActive && lassoSelection) {
      const interval = setInterval(() => {
        renderLassoSelection();
      }, 100); // 100ms마다 점선 효과 업데이트

      return () => clearInterval(interval);
    }
  }, [isLassoSelectionActive, lassoSelection, renderLassoSelection]);

  // Delete 키 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && isLassoSelectionActive && lassoSelection) {
        // 선택된 영역을 이미지에서 삭제
        const imageElement = stageRef.current?.querySelector('img');
        if (imageElement) {
          try {
            const imgRect = imageElement.getBoundingClientRect();
            const imgCanvas = document.createElement('canvas');
            const imgCtx = imgCanvas.getContext('2d');

            if (imgCtx) {
              imgCanvas.width = imgRect.width;
              imgCanvas.height = imgRect.height;

              // 이미지를 canvas에 그리기
              imgCtx.drawImage(imageElement as HTMLImageElement, 0, 0, imgRect.width, imgRect.height);

              // 선택된 영역을 투명하게 만들기
              imgCtx.globalCompositeOperation = 'destination-out';
              imgCtx.fill(lassoSelection);

              // 수정된 이미지를 원본에 적용
              const newImageUrl = imgCanvas.toDataURL();
              (imageElement as HTMLImageElement).src = newImageUrl;

              // 선택 영역 초기화
              setLassoSelection(null);
              setIsLassoSelectionActive(false);
              setDashOffset(0);
            }
          } catch (error) {
            // console.error('EditorSpecialTools: Lasso 선택 영역 삭제 실패:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLassoSelectionActive, lassoSelection, stageRef]);

  return (
    <div
      className={`editor-special-tools ${isActive ? 'active' : ''}`}
      data-active={dataActiveValue}
      data-debug={`tool:${activeTool || 'none'},cursor:${cursorValue},pointer:${pointerEventsValue}`}
      style={{
        zIndex: 30,
        pointerEvents: isActive ? 'auto' : 'none'
      }}
    >
      <canvas
        ref={canvasRef}
        className="special-tools-canvas"
        data-debug={`canvas:${activeTool || 'none'},cursor:${cursorValue}`}
        style={{
          cursor: cursorValue,
          pointerEvents: pointerEventsValue,
          zIndex: 30, // 명시적으로 z-index 설정
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* 도구 설정 패널 - 도구가 활성화되고 설정 표시가 활성화되었을 때만 표시 */}
      {activeTool && currentToolConfig && showSettings && (
        <div className="tool-settings-panel" onClick={handleSettingClick}>
          <div className="tool-info">
            <span className="tool-icon">{currentToolConfig.icon}</span>
            <span className="tool-name">{currentToolConfig.name}</span>
          </div>

          <div className="tool-controls">
            <div className="setting-group" onClick={handleSettingClick}>
              <label>선 굵기:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={toolSettings.lineWidth}
                onChange={(e) => handleToolSettingChange('lineWidth', parseInt(e.target.value))}
                onClick={handleSettingClick}
              />
              <span>{toolSettings.lineWidth}</span>
            </div>

            <div className="setting-group" onClick={handleSettingClick}>
              <label>색상:</label>
              <input
                type="color"
                value={toolSettings.color}
                onChange={(e) => handleToolSettingChange('color', e.target.value)}
                onClick={handleSettingClick}
              />
            </div>

            <div className="setting-group" onClick={handleSettingClick}>
              <label>투명도:</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={toolSettings.opacity}
                onChange={(e) => handleToolSettingChange('opacity', parseFloat(e.target.value))}
                onClick={handleSettingClick}
              />
              <span>{Math.round(toolSettings.opacity * 100)}%</span>
            </div>
          </div>

          <div className="tool-actions">
            <button onClick={handleCancel} className="tool-cancel-btn">
              초기화
            </button>
            <button onClick={() => setShowSettings(false)} className="tool-close-btn">
              숨기기
            </button>
            <button onClick={() => onToolChange(null)} className="tool-deactivate-btn">
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 설정 박스가 숨겨진 상태에서 도구가 활성화되어 있을 때 설정 재표시 버튼 */}
      {activeTool && currentToolConfig && !showSettings && (
        <div className="tool-settings-toggle" onClick={() => setShowSettings(true)}>
          <span className="tool-icon">{currentToolConfig.icon}</span>
          <span className="tool-name">설정</span>
        </div>
      )}
    </div>
  );
}