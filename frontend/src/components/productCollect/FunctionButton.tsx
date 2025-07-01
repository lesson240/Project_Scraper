import React from "react";
import Button from "@/components/common/Button";
import "@/styles/collect/filterButtons.css";


type Props = {
    onReset: () => void;
    onSpecialToday: () => void;
    onCollect: () => void;
};



export default function FilterButtons({ onReset, onSpecialToday, onCollect }: Props) {
    return (
        <div className="button-box">
            <Button variant="secondary" onClick={onReset}>초기화</Button>
            <Button variant="third-rate" onClick={onSpecialToday}>오특</Button>
            <Button variant="primary" onClick={onCollect}>수집</Button>
        </div>
    );
}