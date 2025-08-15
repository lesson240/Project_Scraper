// src/components/productUpload/modals/ThumbModal/parts/EditorSpecialTools.tsx
// ✅ 특수 기능을 가진 도구들을 관리하는 컴포넌트
// ✅ Pencil, Magic Wand, Lasso 등 다양한 도구들을 확장 가능하게 구성

import React, { useRef, useCallback, useEffect, useState } from "react";
import "@/styles/productUpload/editorSpecialTools.css";

export type ToolType = 'pencil' | 'magicWand' | 'lasso' | 'brush' | 'eraser';

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
  brush: {
    type: 'brush',
    icon: '🖌️',
    name: '브러시',
    description: '부드러운 브러시 그리기',
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

  // 도구별 기본 설정 적용
  useEffect(() => {
    console.log('EditorSpecialTools: useEffect - activeTool 변경 감지:', { 
      activeTool, 
      timestamp: Date.now(),
      stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
    });
    
    if (activeTool) {
      console.log('EditorSpecialTools: 도구 활성화됨:', activeTool);
      
      // 도구 활성화 시 설정 박스 기본적으로 숨김
      setShowSettings(false);
      
      let defaultColor = '#ffffff'; // 기본값
      let defaultLineWidth = 2;
      
      switch (activeTool) {
        case 'brush':
          defaultColor = '#ffffff'; // Brush는 white
          defaultLineWidth = 3;
          break;
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
      
      console.log('EditorSpecialTools: 도구별 기본 설정 적용:', { defaultColor, defaultLineWidth });
      
      setToolSettings(prev => ({
        ...prev,
        color: defaultColor,
        lineWidth: defaultLineWidth
      }));
      
      // 도구 활성화 후 약간의 지연으로 상태 확인
      setTimeout(() => {
        console.log('EditorSpecialTools: 도구 활성화 후 상태 확인:', {
          activeTool,
          toolSettings: { color: defaultColor, lineWidth: defaultLineWidth },
          timestamp: Date.now()
        });
      }, 50);
    } else {
      console.log('EditorSpecialTools: 도구 비활성화됨');
      // 도구 비활성화 시 설정 박스도 숨김
      setShowSettings(false);
    }
  }, [activeTool]);

  // Canvas 초기화 및 도구별 설정 적용
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stageRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    canvas.width = stageRect.width;
    canvas.height = stageRect.height;
    
    console.log('EditorSpecialTools: Canvas 초기화 완료:', { 
      width: canvas.width, 
      height: canvas.height, 
      activeTool,
      toolSettings 
    });
    
    // Canvas 스타일 설정
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // toolSettings가 업데이트되기 전에 도구별 기본값 사용
      let currentColor = toolSettings.color;
      let currentLineWidth = toolSettings.lineWidth;
      
      if (activeTool) {
        switch (activeTool) {
          case 'brush':
            currentColor = '#ffffff';
            currentLineWidth = 3;
            break;
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
        console.log('EditorSpecialTools: Eraser 모드 설정됨 - 이미지도 함께 지움');
      } else if (activeTool && activeTool === 'lasso') {
        ctx.globalCompositeOperation = 'source-over';
        console.log('EditorSpecialTools: Lasso 영역 선택 모드 설정됨');
      } else {
        ctx.globalCompositeOperation = 'source-over';
        console.log('EditorSpecialTools: 일반 그리기 모드 설정됨');
      }
      
      console.log('EditorSpecialTools: Canvas 설정 완료:', {
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        globalAlpha: ctx.globalAlpha,
        globalCompositeOperation: ctx.globalCompositeOperation,
        사용된색상: currentColor,
        사용된선굵기: currentLineWidth
      });
    }
  }, [stageRef, activeTool]); // toolSettings 의존성 제거

  // 도구별 그리기 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('EditorSpecialTools: handleMouseDown 호출됨:', { activeTool, isDrawing });
    
    if (!activeTool || !canvasRef.current) {
      console.log('EditorSpecialTools: handleMouseDown 조건 불만족:', { activeTool, canvasRef: !!canvasRef.current });
      return;
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('EditorSpecialTools: 마우스 좌표:', { x, y, rect });
    
    // Canvas 설정 재적용 - 도구별 기본값 사용
    const ctx = canvas.getContext('2d');
    let currentColor = toolSettings.color;
    let currentLineWidth = toolSettings.lineWidth;
    
    if (ctx) {
      // 도구별 기본값 즉시 적용
      if (activeTool) {
        switch (activeTool) {
          case 'brush':
            currentColor = '#ffffff';
            currentLineWidth = 3;
            break;
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
        console.log('EditorSpecialTools: Eraser 모드로 설정됨 - 이미지도 함께 지움');
      } else if (activeTool === 'lasso') {
        // Lasso 도구: 영역 선택을 위한 투명한 채우기
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // 반투명 초록색
        console.log('EditorSpecialTools: Lasso 영역 선택 모드로 설정됨');
      } else {
        ctx.globalCompositeOperation = 'source-over';
        console.log('EditorSpecialTools: 일반 그리기 모드로 설정됨');
      }
      
      console.log('EditorSpecialTools: Canvas 설정 재적용 완료:', {
        strokeStyle: ctx.strokeStyle,
        lineWidth: ctx.lineWidth,
        globalAlpha: ctx.globalAlpha,
        globalCompositeOperation: ctx.globalCompositeOperation,
        사용된색상: currentColor,
        사용된선굵기: currentLineWidth
      });
    }
    
    const path = new Path2D();
    path.moveTo(x, y);
    
    setCurrentPath(path);
    setIsDrawing(true);
    
    console.log('EditorSpecialTools: 그리기 시작됨:', { activeTool, isDrawing: true });
    
    // Eraser 도구일 때는 즉시 지우기 시작
    if (activeTool === 'eraser' && ctx) {
      ctx.beginPath();
      ctx.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);
      ctx.fill();
      console.log('EditorSpecialTools: Eraser 지우기 시작');
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
          case 'brush':
            currentColor = '#ffffff';
            currentLineWidth = 3;
            break;
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
        // Eraser 도구: 지우개 효과
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else if (activeTool && activeTool === 'lasso') {
        // Lasso 도구: 영역 선택을 위한 선 그리기
        ctx.globalCompositeOperation = 'source-over';
        ctx.stroke(currentPath);
        // 영역을 채우기 위한 추가 처리
        ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.fill();
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
        console.log('EditorSpecialTools: 도구 완료, viewer에 데이터 전달 (영구 저장):', toolData);
      }
    }
    
    // 현재 경로만 초기화하고 도구 상태는 유지
    setCurrentPath(null);
    
    console.log('EditorSpecialTools: 그리기 완료, 도구 상태 유지, 내용 영구 저장:', activeTool);
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
    
    console.log('EditorSpecialTools: 그린 내용 취소, 도구 상태 유지:', activeTool);
  }, [activeTool, paths]);

  // 도구별 설정 변경
  const handleToolSettingChange = useCallback((setting: keyof typeof toolSettings, value: any) => {
    console.log('EditorSpecialTools: 도구 설정 변경:', { setting, value, activeTool });
    
    setToolSettings(prev => ({ ...prev, [setting]: value }));
    
    // 설정 변경 시 즉시 Canvas에 반영
    const canvas = canvasRef.current;
    if (canvas && activeTool) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (setting === 'lineWidth') {
          ctx.lineWidth = value;
          console.log('EditorSpecialTools: 선 굵기 변경됨:', value);
        } else if (setting === 'color') {
          ctx.strokeStyle = value;
          console.log('EditorSpecialTools: 색상 변경됨:', value);
        } else if (setting === 'opacity') {
          ctx.globalAlpha = value;
          console.log('EditorSpecialTools: 투명도 변경됨:', value);
        }
      }
    }
  }, [activeTool]);

  // 설정 박스 내부 요소 클릭 이벤트 처리
  const handleSettingClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    console.log('EditorSpecialTools: 설정 요소 클릭됨:', e.target);
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
        case 'brush':
          currentColor = '#ffffff';
          currentLineWidth = 3;
          break;
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
      console.log('EditorSpecialTools: 경로 다시 그리기 - Eraser 모드');
    } else {
      ctx.globalCompositeOperation = 'source-over';
      console.log('EditorSpecialTools: 경로 다시 그리기 - 일반 모드');
    }
    
    paths.forEach(path => {
      ctx.stroke(path);
    });
    
    console.log('EditorSpecialTools: 경로 다시 그리기 완료:', {
      사용된색상: currentColor,
      사용된선굵기: currentLineWidth,
      경로개수: paths.length
    });
  }, [paths, activeTool, toolSettings]);

  // 현재 활성화된 도구의 설정 가져오기
  const currentToolConfig = activeTool ? TOOL_CONFIGS[activeTool] : null;

  console.log('EditorSpecialTools: 렌더링 상태:', {
    activeTool,
    currentToolConfig: currentToolConfig ? {
      type: currentToolConfig.type,
      name: currentToolConfig.name,
      cursor: currentToolConfig.cursor
    } : null,
    toolSettings,
    isDrawing,
    pathsCount: paths.length
  });

  // 도구가 활성화되지 않았을 때도 렌더링 (CSS에서 pointer-events 제어)
  const dataActiveValue = activeTool ? "true" : "false";
  const cursorValue = activeTool ? currentToolConfig?.cursor || 'crosshair' : 'default';
  const pointerEventsValue = activeTool ? 'auto' : 'none';
  const isActive = !!activeTool;
  
  console.log('EditorSpecialTools: CSS 속성:', {
    dataActive: dataActiveValue,
    cursor: cursorValue,
    pointerEvents: pointerEventsValue,
    className: 'editor-special-tools',
    dataActiveAttr: `data-active="${dataActiveValue}"`,
    zIndex: 30,
    선택상자ZIndex: 20,
    isActive
  });

  // 도구가 활성화되었을 때 선택상자 이벤트를 일시적으로 비활성화
  useEffect(() => {
    if (activeTool) {
      console.log('EditorSpecialTools: 도구 활성화됨:', activeTool);
      
      // 도구별 커서 설정
      if (activeTool === 'lasso') {
        document.body.style.cursor = 'crosshair';
        console.log('EditorSpecialTools: Lasso 도구 - crosshair 커서 설정');
      } else {
        document.body.style.cursor = 'crosshair';
        console.log('EditorSpecialTools: 그리기 도구 - crosshair 커서 설정');
      }
    } else {
      console.log('EditorSpecialTools: 도구 비활성화됨');
      document.body.style.cursor = 'default';
      console.log('EditorSpecialTools: 기본 커서로 복원');
    }

    // 컴포넌트 언마운트 시 커서 복원
    return () => {
      document.body.style.cursor = 'default';
    };
  }, [activeTool]);

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