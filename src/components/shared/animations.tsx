"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type Variants,
  type MotionValue,
} from "framer-motion";
import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";

/* ============================================================
   PREMIUM EASING CURVES
   Used by top-tier sites (Linear, Vercel, Fable, Kimi)
   ============================================================ */

export const EASE = {
  /** Smooth deceleration — the "premium" feel */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Snappy in-out for interactions */
  snap: [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Gentle, natural */
  gentle: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  /** Spring configs */
  springSoft: { type: "spring" as const, stiffness: 200, damping: 26 },
  springSnappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  springBouncy: { type: "spring" as const, stiffness: 260, damping: 18 },
};

/* ============================================================
   SCROLL REVEAL
   Reliable viewport-triggered entrance animation.
   Fires when the element enters the viewport (scroll down or up).
   ============================================================ */

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Animation direction: up, down, left, right, scale, fade */
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  /** Distance to travel (px) */
  distance?: number;
  /** Delay before animation (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Only animate once, or every time it enters viewport */
  once?: boolean;
  /** Viewport margin to trigger earlier/later */
  margin?: string;
  style?: CSSProperties;
};

export function ScrollReveal({
  children,
  className = "",
  direction = "up",
  distance = 40,
  delay = 0,
  duration = 0.7,
  once = true,
  margin = "-80px",
  style,
}: ScrollRevealProps) {
  const offset = getOffset(direction, distance);

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...offset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: EASE.out,
      },
    },
  };

  return (
    <motion.div
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
    >
      {children}
    </motion.div>
  );
}

function getOffset(
  direction: string,
  distance: number
): { x?: number; y?: number; scale?: number } {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "scale":
      return { scale: 0.92 };
    case "fade":
    default:
      return {};
  }
}

/* ============================================================
   STAGGER CONTAINER
   Wraps children that animate in sequence as the section enters view.
   ============================================================ */

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Delay between each child (seconds) */
  stagger?: number;
  /** Delay before first child (seconds) */
  delayChildren?: number;
  once?: boolean;
  margin?: string;
  style?: CSSProperties;
};

export function StaggerContainer({
  children,
  className = "",
  stagger = 0.1,
  delayChildren = 0.05,
  once = true,
  margin = "-80px",
  style,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Child of StaggerContainer — animates up + fades in */
export function StaggerItem({
  children,
  className = "",
  direction = "up",
  distance = 30,
  style,
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale";
  distance?: number;
  style?: CSSProperties;
}) {
  const offset = getOffset(direction, distance);
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, ...offset },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          transition: { duration: 0.6, ease: EASE.out },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   TEXT REVEAL
   Headlines that animate word-by-word or line-by-line.
   ============================================================ */

type TextRevealProps = {
  text: string;
  className?: string;
  /** "words" splits by spaces, "block" animates the whole text */
  mode?: "words" | "block";
  delay?: number;
  stagger?: number;
  style?: CSSProperties;
};

export function TextReveal({
  text,
  className = "",
  mode = "words",
  delay = 0,
  stagger = 0.06,
  style,
}: TextRevealProps) {
  if (mode === "block") {
    return (
      <motion.span
        className={className}
        style={style}
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay, ease: EASE.out }}
      >
        {text}
      </motion.span>
    );
  }

  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      style={{ display: "inline-block", ...style }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{ display: "inline-block", overflow: "hidden", marginRight: "0.25em" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            variants={{
              hidden: { y: "100%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.6, ease: EASE.out },
              },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ============================================================
   PARALLAX LAYER
   Moves at a different rate than the scroll, creating depth.
   Wrap in a relative parent.
   ============================================================ */

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Speed: 0 = fixed, 1 = scrolls normally, negative = opposite direction */
  speed?: number;
  style?: CSSProperties;
};

export function ParallaxLayer({
  children,
  className = "",
  speed = 0.3,
  style,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -speed * 200]);
  const ySmooth = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: ySmooth, ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   MAGNETIC CARD
   Hovers and subtly tilts toward the cursor — the premium hover effect.
   ============================================================ */

type MagneticCardProps = {
  children: ReactNode;
  className?: string;
  /** Tilt strength (degrees) */
  strength?: number;
  /** Lift on hover (px) */
  lift?: number;
  style?: CSSProperties;
};

export function MagneticCard({
  children,
  className = "",
  strength = 8,
  lift = 6,
  style,
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring for the tilt
  const xSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const ySpring = useSpring(y, { stiffness: 200, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: useTransform(ySpring, [-strength, strength], [strength, -strength]),
        rotateY: useTransform(xSpring, [-strength, strength], [-strength, strength]),
        transformPerspective: 800,
        ...style,
      }}
      whileHover={{ y: -lift, transition: { duration: 0.3, ease: EASE.out } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   FLOATING ELEMENT
   Gently floats up and down — for background orbs, icons, accents.
   ============================================================ */

type FloatingProps = {
  children?: ReactNode;
  className?: string;
  /** Float distance (px) */
  distance?: number;
  /** Duration of one float cycle (seconds) */
  duration?: number;
  delay?: number;
  style?: CSSProperties;
};

export function Floating({
  children,
  className = "",
  distance = 15,
  duration = 6,
  delay = 0,
  style,
}: FloatingProps) {
  return (
    <motion.div
      className={className}
      style={style}
      animate={{
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   GRADIENT TEXT
   Animated gradient text that shifts colors over time.
   ============================================================ */

type GradientTextProps = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
};

export function GradientText({
  children,
  className = "",
  colors = ["#06b6d4", "#14b8a6", "#10b981", "#06b6d4"],
  duration = 6,
}: GradientTextProps) {
  const gradient = colors.join(", ");
  return (
    <motion.span
      className={`bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(100deg, ${gradient})`,
        backgroundSize: "200% 100%",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}

/* ============================================================
   SHIMMER LINE
   A horizontal line that shimmers — section dividers, accents.
   ============================================================ */

export function ShimmerLine({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-slate-200/40" />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ============================================================
   SCROLL PROGRESS BAR
   Thin gradient bar at the top showing scroll progress.
   ============================================================ */

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.5 origin-left z-[100] pointer-events-none"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #06b6d4, #14b8a6, #10b981)",
      }}
    />
  );
}

/* ============================================================
   USE VIEWPORT DETECTION
   Returns true when an element enters the viewport — for triggering
   non-animation effects (like counting numbers).
   ============================================================ */

export function useInView<T extends Element>(
  margin = "-80px"
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: margin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin]);

  return [ref, inView];
}

/* ============================================================
   PAGE TRANSITION
   Smooth fade + slide transition for view changes.
   ============================================================ */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: EASE.snap },
  },
};
