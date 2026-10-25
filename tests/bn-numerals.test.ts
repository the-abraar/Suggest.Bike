import test from "node:test";
import assert from "node:assert/strict";
import { bnNumerals } from "../src/lib/bike-utils";

test("bnNumerals converts plain numbers and units, keeps model names", () => {
  assert.equal(bnNumerals("60 km/h পর্যন্ত, 100cc ক্লাস, ৳1,40,100"), "৬০ km/h পর্যন্ত, ১০০cc ক্লাস, ৳১,৪০,১০০");
  assert.equal(bnNumerals("50-60 km/h, 2026 সালে, 2.5 লাখ, 60+ kmpl"), "৫০-৬০ km/h, ২০২৬ সালে, ২.৫ লাখ, ৬০+ kmpl");
  assert.equal(bnNumerals("Yamaha R15 V4 আর Pulsar N160, TVS Apache RTR 160 4V, GSX-R150, SP125"), "Yamaha R15 V4 আর Pulsar N160, TVS Apache RTR 160 4V, GSX-R150, SP125");
  assert.equal(bnNumerals("(5-স্পিড) Platina 110 H"), "(৫-স্পিড) Platina 110 H");
  assert.equal(bnNumerals("হটলাইন 16638, https://x.com/a1/2 আর 09638"), "হটলাইন 16638, https://x.com/a1/2 আর 09638");
});
