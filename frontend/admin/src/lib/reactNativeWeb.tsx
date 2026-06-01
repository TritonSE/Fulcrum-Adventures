import React, {
  type CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

type StyleValue = CSSProperties | false | null | undefined;
type StyleProp = StyleValue | StyleValue[];
type DOMProps<T> = Omit<React.HTMLAttributes<T>, "style"> & {
  style?: StyleProp;
};

const flattenStyle = (style?: StyleProp): CSSProperties | undefined => {
  if (!style) return undefined;
  if (!Array.isArray(style)) return style || undefined;

  return style.reduce<CSSProperties>((acc, entry) => {
    if (!entry) return acc;
    return { ...acc, ...entry };
  }, {});
};

const toPx = (value: number | string | undefined) => (typeof value === "number" ? `${value}px` : value);

const textStyleFixups = (style?: CSSProperties): CSSProperties | undefined => {
  if (!style) return style;

  const next = { ...style };
  if (typeof next.lineHeight === "number") {
    next.lineHeight = `${next.lineHeight}px`;
  }
  return next;
};

const createPressHandler = <T extends HTMLElement>(
  onPress?: (event: React.MouseEvent<T>) => void,
  disabled?: boolean,
) => {
  if (!onPress || disabled) return undefined;
  return (event: React.MouseEvent<T>) => onPress(event);
};

export const StyleSheet = {
  create<T extends Record<string, CSSProperties>>(styles: T): T {
    return styles;
  },
  absoluteFillObject: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  } as CSSProperties,
};

export const Platform = { OS: "web" as const };
export const UIManager = {
  setLayoutAnimationEnabledExperimental: () => undefined,
};
export const LayoutAnimation = {
  Presets: {
    easeInEaseOut: {},
  },
  configureNext: () => undefined,
};

export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 720 : window.innerHeight,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
};

export const View = ({ ref, style, pointerEvents, ...props }: DOMProps<HTMLDivElement> & { pointerEvents?: string } & { ref?: React.RefObject<HTMLDivElement | null> }) => (
    <div
      ref={ref}
      style={{
        boxSizing: "border-box",
        ...flattenStyle(style),
        pointerEvents,
      }}
      {...props}
    />
  );
View.displayName = "View";

export const Text = ({ ref, style, numberOfLines, ...props }: DOMProps<HTMLSpanElement> & { numberOfLines?: number; ellipsizeMode?: string } & { ref?: React.RefObject<HTMLSpanElement | null> }) => {
  const baseStyle = textStyleFixups(flattenStyle(style));
  const lineClampStyle =
    typeof numberOfLines === "number"
      ? ({
          display: "-webkit-box",
          WebkitLineClamp: numberOfLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } as CSSProperties)
      : undefined;

  return <span ref={ref} style={{ ...baseStyle, ...lineClampStyle }} {...props} />;
};
Text.displayName = "Text";

export const Pressable = ({ ref, style, onPress, disabled, ...props }: DOMProps<HTMLDivElement> & { onPress?: (event: React.MouseEvent<HTMLDivElement>) => void; disabled?: boolean } & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={ref}
    onClick={createPressHandler(onPress, disabled)}
    style={{
      boxSizing: "border-box",
      cursor: disabled ? "default" : "pointer",
      ...flattenStyle(style),
    }}
    {...props}
  />
);
Pressable.displayName = "Pressable";

export const TouchableOpacity = ({ ref, style, onPress, disabled, ...props }: DOMProps<HTMLDivElement> & {
    onPress?: (event: React.MouseEvent<HTMLDivElement>) => void;
    activeOpacity?: number;
    disabled?: boolean;
  } & { ref?: React.RefObject<HTMLDivElement | null> }) => (
  <div
    ref={ref}
    onClick={createPressHandler(onPress, disabled)}
    style={{
      boxSizing: "border-box",
      cursor: disabled ? "default" : "pointer",
      ...flattenStyle(style),
    }}
    {...props}
  />
);
TouchableOpacity.displayName = "TouchableOpacity";

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "style" | "onChange"> &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "style" | "onChange"> & {
    style?: StyleProp;
    onChangeText?: (value: string) => void;
    multiline?: boolean;
    numberOfLines?: number;
    placeholderTextColor?: string;
    editable?: boolean;
  };

export const TextInput = (
    { ref, style, onChangeText, multiline, numberOfLines, placeholderTextColor, editable = true, value, ...props }: TextInputProps & { ref?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null> },
  ) => {
    const mergedStyle = flattenStyle(style);
    const sharedStyle: CSSProperties = {
      boxSizing: "border-box",
      outline: "none",
      ...mergedStyle,
    };

    const commonProps = {
      ...props,
      value,
      disabled: !editable || props.disabled,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChangeText?.(event.target.value),
      style: sharedStyle,
    };

    if (multiline) {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          rows={numberOfLines}
          {...(commonProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        {...(commonProps as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  };
TextInput.displayName = "TextInput";

type ScrollViewProps = DOMProps<HTMLDivElement> & {
  contentContainerStyle?: StyleProp;
  showsVerticalScrollIndicator?: boolean;
  nestedScrollEnabled?: boolean;
};

export const ScrollView = ({ ref, style, contentContainerStyle, children, showsVerticalScrollIndicator = true, ...props }: ScrollViewProps & { ref?: React.RefObject<HTMLDivElement | null> }) => (
    <div
      ref={ref}
      style={{
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: showsVerticalScrollIndicator ? undefined : "none",
        ...flattenStyle(style),
      }}
      {...props}
    >
      <div style={{ boxSizing: "border-box", ...flattenStyle(contentContainerStyle) }}>{children}</div>
    </div>
  );
ScrollView.displayName = "ScrollView";

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "style" | "src" | "onLoad"> & {
  source?: { uri: string } | string | null;
  style?: StyleProp;
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  onLoad?: (event: { nativeEvent: { source: { width: number; height: number } } }) => void;
};

type ImageComponent = React.ForwardRefExoticComponent<
  ImageProps & React.RefAttributes<HTMLImageElement>
> & {
  getSize: (
    uri: string,
    success: (width: number, height: number) => void,
    failure?: (error: Error) => void,
  ) => void;
};

const ImageBase = ({ ref, source, style, resizeMode = "cover", onLoad, ...props }: ImageProps & { ref?: React.RefObject<HTMLImageElement | null> }) => {
    const src = typeof source === "string" ? source : source?.uri;
    return (
      <img
        ref={ref}
        src={src}
        onLoad={(event) =>
          onLoad?.({
            nativeEvent: {
              source: {
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              },
            },
          })
        }
        style={{
          boxSizing: "border-box",
          display: "block",
          objectFit: resizeMode === "stretch" ? "fill" : resizeMode,
          ...flattenStyle(style),
        }}
        {...props}
      />
    );
  } as ImageComponent;
ImageBase.displayName = "Image";

ImageBase.getSize = (uri, success, failure) => {
  const image = new window.Image();
  image.onload = () => success(image.naturalWidth, image.naturalHeight);
  image.onerror = () => failure?.(new Error("Unable to load image."));
  image.src = uri;
};

export const Image = ImageBase;

export const Modal: React.FC<{
  visible: boolean;
  transparent?: boolean;
  children?: React.ReactNode;
  onRequestClose?: () => void;
  onShow?: () => void;
}> = ({ visible, children, onShow }) => {
  useEffect(() => {
    if (visible) onShow?.();
  }, [onShow, visible]);

  if (!visible || typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

export const ActivityIndicator: React.FC<{ color?: string }> = ({ color = "#153A7A" }) => (
  <div
    style={{
      width: "18px",
      height: "18px",
      borderRadius: "999px",
      border: `2px solid ${color}33`,
      borderTopColor: color,
      animation: "rn-web-spin 0.8s linear infinite",
    }}
  />
);

if (typeof document !== "undefined" && !document.getElementById("rn-web-spinner-style")) {
  const styleTag = document.createElement("style");
  styleTag.id = "rn-web-spinner-style";
  styleTag.textContent = "@keyframes rn-web-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
  document.head.appendChild(styleTag);
}

export type LayoutChangeEvent = {
  nativeEvent: {
    layout: {
      width: number;
      height: number;
    };
  };
};

export type PanResponderInstance = {
  panHandlers: Record<string, never>;
};

export const PanResponder = {
  create: () => ({
    panHandlers: {},
  }),
};

export type ImageSourcePropType = string;

export const useStyle = (style?: StyleProp) => useMemo(() => flattenStyle(style), [style]);
