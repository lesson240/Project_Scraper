import React from "react";
import SearchFilterSection from "@/components/productUpload/searchFilterSection/SearchFilterSection";

import "@/styles/section.css"

export default function ProductUploadPage() {
    return (
        <div>
            <div className="columns-auto-fit-large">
                <SearchFilterSection />
            </div>
        </div>
    );
}
