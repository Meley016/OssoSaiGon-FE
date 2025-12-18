import { useState } from "react";
import { useTranslation } from "react-i18next";

/* ================= MENU ================= */
export function FaqMenu({ active, onChange }) {
  const { t } = useTranslation();

  const categories = Object.keys(
    t("faq.categories", { returnObjects: true })
  );

  return (
    <>
        <div className="flex flex-col h-[345px] justify-center items-center">
            <h3 className=" font-semibold mb-6 text-center">
                FAQs
            </h3>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-center max-w-md">
                {categories.map((key) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={`cursor-pointer lowercase transition whitespace-nowrap
                    ${
                        active === key
                        ? "text-black font-semibold"
                        : "text-gray-400 hover:text-black"
                    }
                    `}
                >
                    {t(`faq.categories.${key}`)}
                </button>
                ))}
            </div>
        </div>
    </>
  );
}

/* ================= CONTENT ================= */
export function FaqContent({ category }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(null);

  const items = t(`faq.${category}`, { returnObjects: true });

  return (
    <div className="text-sm">
      {items.map((item, idx) => {
        const isOpen = open === idx;

        return (
          <div key={idx} className="border-b">
            <button
              onClick={() => setOpen(isOpen ? null : idx)}
              className={`w-full py-4 flex justify-between lowercase items-center text-left
                ${isOpen ? "text-pink-600" : ""}
              `}
            >
              {item.q}
              <span>{isOpen ? "˄" : "˅"}</span>
            </button>

            {isOpen && (
              <div className="bg-pink-50 p-4 lowercase text-gray-600">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


/* ================= MAIN EXPORT ================= */
export default function FaqSection() {
  const [active, setActive] = useState("orders");

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <FaqMenu
        active={active}
        onChange={(key) => setActive(key)}
      />

      <FaqContent category={active} />
    </section>
  );
}
