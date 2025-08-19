import React, { useEffect, useRef, useState } from 'react';
import { ModalBase, ModalHeader, ModalBody, ModalFooter } from '@/components/common/Modal';
import 'tui-image-editor/dist/tui-image-editor.css';
import '@/styles/productUpload/modals/ToastImageEditorModal.css';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (editedImageUrl: string) => void;
};

export default function ToastImageEditorModal({ isOpen, onClose, imageUrl, onSave }: Props) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [editor, setEditor] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !editorRef.current || !imageUrl) return;

        const initEditor = async () => {
            try {
                setIsLoading(true);
                const { default: ImageEditor } = await import('tui-image-editor');
                const newEditor = new ImageEditor(editorRef.current, {
                    includeUI: {
                        loadImage: { path: imageUrl, name: 'image' },
                        theme: { 'common.bi.image': '', 'common.bisize.width': '0px', 'common.bisize.height': '0px', 'common.backgroundImage': 'none' },
                        uiSize: { width: '100%', height: '600px' },
                        menuBarPosition: 'bottom'
                    },
                    cssMaxWidth: 700,
                    cssMaxHeight: 500
                });
                setEditor(newEditor);
                setIsLoading(false);
            } catch (error) {
                console.error('Toast Image Editor 초기화 실패:', error);
                setIsLoading(false);
            }
        };
        initEditor();
        return () => { if (editor) { editor.destroy(); setEditor(null); } };
    }, [isOpen, imageUrl]);

    const handleSave = () => {
        if (editor) {
            try {
                const canvas = editor.toDataURL();
                onSave(canvas);
            } catch (error) {
                console.error('이미지 저장 실패:', error);
            }
        }
    };

    const handleReset = () => {
        if (editor) {
            editor.reset();
        }
    };

    if (!isOpen) return null;
    return (
        <ModalBase isOpen={isOpen} onClose={onClose}>
            <ModalHeader><h2>Toast Image Editor</h2></ModalHeader>
            <ModalBody>
                {isLoading ? (
                    <div className="toast-editor-loading">
                        <p>에디터를 로딩 중입니다...</p>
                    </div>
                ) : (
                    <div className="toast-editor-container">
                        <div ref={editorRef} className="toast-editor" />
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <div className="toast-editor-footer">
                    <button className="btn-reset" onClick={handleReset}>초기화</button>
                    <button className="btn-save" onClick={handleSave}>저장</button>
                    <button className="btn-close" onClick={onClose}>닫기</button>
                </div>
            </ModalFooter>
        </ModalBase>
    );
}
