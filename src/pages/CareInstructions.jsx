import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function CareInstructions() {
  const { t } = useTranslation();
  const [open, setOpen] = useState("denims");

  const sections = ["denims", "tops", "bottoms", "outerwears", "footwears"];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm sm:text-base api-text">
      {/* TITLE */}
      <h1 className="
        hardcode-text
        text-center
        text-2xl sm:text-3xl md:text-[40px]
        leading-snug
        mt-16 sm:mt-20 mb-8 sm:mb-10
      ">
        {t("care.title")}
      </h1>

      <div className="space-y-3 sm:space-y-4">
        {sections.map((key) => (
          <div key={key}>
            {/* HEADER */}
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="
                w-full flex justify-between items-center
                border-b
                py-3 sm:py-4
                hardcode-text
                text-base sm:text-lg md:text-[24px]
                leading-snug
                text-left
              "
            >
              <span className="pr-3 break-words">
                {t(`care.${key}.title`)}
              </span>

              <ChevronDown
                size={20}
                className={`flex-shrink-0 transition-transform duration-300 ${
                  open === key ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* CONTENT */}
            {open === key && (
              <div className="pb-5 sm:pb-6 space-y-5 api-text">
                {t(`care.${key}.groups`, {
                  returnObjects: true,
                }).map((group, idx) => (
                  <div key={idx}>
                    <h3 className="
                      hardcode-text
                      text-sm sm:text-base md:text-[18px]
                      ml-2 sm:ml-5
                      my-2 sm:my-3
                      leading-snug
                    ">
                      {group.name}
                    </h3>

                    <ul className="
                      list-disc
                      pl-4 sm:pl-5
                      ml-2 sm:ml-5
                      space-y-2 sm:space-y-1
                      text-gray-600
                      leading-relaxed
                    ">
                      {group.items.map((item, i) => (
                        <li key={i} className="break-words">
                          {item}
                        </li>
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
