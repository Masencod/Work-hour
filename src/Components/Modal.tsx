import { useEffect } from "react";

const Modal = ({
  isOpen = false,
  setIsOpen,
  onOverlayClick = () => {},
  className = "",
  children,
}: {
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOverlayClick?: Function,
  className?: string,
  children: React.ReactNode,
}) => {

  
  useEffect(() => {
    const handleWindowResize = () => {
      if (isOpen) {
        document.body.classList.add("modal-open");
      } else {
        document.body.classList.remove("modal-open");
        setIsOpen(false)
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
          setIsOpen(false);
        }
      }}
      className={`${!isOpen ? "!hidden" : ""} overlay`}
    >
      <div
        className={`bodyContainer animationScaleUp rounded-t-3xl w-full h-[65vh] md:top-1/4 md:rounded-xl md:mx-auto md:w-[500px] md:h ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;