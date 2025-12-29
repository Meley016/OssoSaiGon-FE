import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function CareInstructions() {
  const { t } = useTranslation();
  const [open, setOpen] = useState("denims");

  const sections = [
    "denims",
    "tops",
    "bottoms",
    "outerwears",
    "footwears",
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 text-sm">
      <h1 className="uppercase text-[40px] text-center mt-20 font-medium mb-10">
        {t("care.title")}
      </h1>

      <div className="space-y-4">
        {sections.map((key) => (
          <div key={key} className="">
            {/* HEADER */}
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="w-full flex border-b text-[24px] justify-between items-center py-4 uppercase font-medium"
            >
              {t(`care.${key}.title`)}
              <ChevronDown
                size={16}
                className={`transition ${
                  open === key ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* CONTENT */}
            {open === key && (
              <div className="pb-6 space-y-6">
                {t(`care.${key}.groups`, {
                  returnObjects: true,
                }).map((group, idx) => (
                  <div key={idx}>
                    <h3 className="uppercase text-[18px] ml-5 my-3">
                      {group.name}
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 ml-5 text-gray-600">
                      {group.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
