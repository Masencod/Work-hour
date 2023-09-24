import { useEffect } from "react";

const Modal = ({
  isOpen,
  setIsOpen,
  onOverlayClick = console.log,
  className = "",
  children,
}: {
  isOpen: boolean,
  setIsOpen: () => void,
  onOverlayClick?: Function,
  className?: string,
  children: React.ReactNode,
}) => {

  
  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 1023) {
        if (isOpen) {
          document.body.classList.add("modal-open");
        } else {
          document.body.classList.remove("modal-open");
        }
      }
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [isOpen]);

  return (
    <div
      onClick={(e: any) => {
        if (e && typeof e.target.className === "string" && e.target.className.includes("overlay")) {
          e.stopPropagation();
          setIsOpen();
          onOverlayClick();
        }
      }}
      className={`overlay ${!isOpen ? "hidden" : ""} lg:hidden`}
    >
      <div
        className={`bodyContainer animationScaleUp ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;