import ui from "@zos/ui";
import { Battery, HeartRate, Step } from "@zos/sensor";
import { Time } from "@zos/sensor";

const IMAGE = "images/";
const WHITE = 0xf0f0f0;
const GRAY = 0xbebebe;
const BLACK = 0x000000;
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const digits = (part) =>
  Array.from({ length: 10 }, (_, n) => `${IMAGE}digits/${part}/${n}.png`);
const pad2 = (value) => String(value).padStart(2, "0");
const valid = (value) => Number.isFinite(value) && value > 0;

function textWidget(x, y, w, h, size, color, align = ui.align.LEFT) {
  return ui.createWidget(ui.widget.TEXT, {
    x,
    y,
    w,
    h,
    text: "",
    color,
    text_size: size,
    align_h: align,
    align_v: ui.align.CENTER_V,
    text_style: ui.text_style.NONE,
    show_level: ui.show_level.ONLY_NORMAL,
  });
}

function setText(widget, value) {
  if (widget) widget.setProperty(ui.prop.MORE, { text: String(value) });
}

const baseStepsX = [220, 242];

WatchFace({
  build() {
    const face = this;
    ui.createWidget(ui.widget.IMG, {
      x: 0,
      y: 0,
      src: `${IMAGE}background.png`,
      show_level: ui.show_level.ONLY_NORMAL,
    });

    ui.createWidget(ui.widget.IMG_TIME, {
      hour_zero: 1,
      hour_startX: 161,
      hour_startY: 134,
      hour_array: digits("hour"),
      hour_space: 0,
      hour_align: ui.align.LEFT,
      minute_follow: 0,
      minute_startX: 161,
      minute_startY: 259,
      minute_array: digits("minute"),
      minute_space: 0,
      minute_align: ui.align.LEFT,
      second_follow: 0,
      show_level: ui.show_level.ONLY_NORMAL,
    });

    face.battery = new Battery();
    face.heart = new HeartRate();
    face.step = new Step();
    face.time = new Time();

    face.batteryText = textWidget(baseStepsX[0], 66, 82, 32, 23, WHITE);

    face.batteryFill = ui.createWidget(ui.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      color: BLACK,
      show_level: ui.show_level.ONLY_NORMAL,
    });

    ui.createWidget(ui.widget.IMG, {
      x: 100,
      y: 222,
      src: `${IMAGE}heart.png`,
    });
    const stepsIcon = ui.createWidget(ui.widget.IMG, {
      x: 210,
      y: 400,
      src: `${IMAGE}steps.png`,
    });

    face.heartText = textWidget(99, 254, 60, 36, 26, WHITE);
    face.stepText = textWidget(baseStepsX[1], 398, 90, 34, 25, GRAY);
    face.weekText = textWidget(342, 217, 100, 30, 23, WHITE);
    face.dateText = textWidget(342, 247, 90, 39, 30, WHITE);

    face.updateBattery = () => {
      const level = Math.max(
        0,
        Math.min(100, Math.round(face.battery.getCurrent())),
      );
      setText(face.batteryText, `${level}%`);
    };
    face.updateHeart = () => {
      const last = face.heart.getLast();
      const res = valid(last) ? Math.round(last).toString() : "--";
      face.heartText.setProperty(ui.prop.MORE, {
        x: res.length === 2 ? 99 : 89,
      });
      setText(face.heartText, res);
    };
    face.updateSteps = () => {
      const current = face.step.getCurrent();
      const res =
        Number.isFinite(current) && current >= 0
          ? Math.round(current).toString()
          : "--";
      const newStepsX = baseStepsX[1] - res.length * 5;
      const newIconX = baseStepsX[0] - res.length * 5;
      face.stepText.setProperty(ui.prop.MORE, { x: newStepsX });
      stepsIcon.setProperty(ui.prop.MORE, { x: newIconX });
      setText(face.stepText, res);
    };
    face.updateDate = () => {
      setText(face.weekText, DAYS[face.time.getDay() - 1] || "---");
      setText(face.dateText, pad2(face.time.getDate()));
    };

    face.updateBattery();
    face.updateHeart();
    face.updateSteps();
    face.updateDate();

    face.battery.onChange(face.updateBattery);
    face.heart.onLastChange(face.updateHeart);
    face.step.onChange(face.updateSteps);
    face.time.onPerDay(face.updateDate);
  },

  onDestroy() {
    if (this.battery && this.updateBattery)
      this.battery.offChange(this.updateBattery);
    if (this.heart && this.updateHeart)
      this.heart.offLastChange(this.updateHeart);
    if (this.step && this.updateSteps) this.step.offChange(this.updateSteps);
    if (this.time && this.updateDate) this.time.offPerDay(this.updateDate);
  },
});
