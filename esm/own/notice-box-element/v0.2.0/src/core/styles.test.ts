/* packages/notice-box/src/core/styles.test.ts */
import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { colorPicker, styleMap } from "./styles.mjs";

Deno.test("colorPicker", async (t) => {
  await t.step("returns correct colors for warn", () => {
    const result = colorPicker('warn');
    assertEquals(result, {
      color: 'yellow',
      textColor: 'black'
    });
  });

  await t.step("returns correct colors for error", () => {
    const result = colorPicker('error');
    assertEquals(result, {
      color: 'red',
      textColor: 'white'
    });
  });

  await t.step("returns correct colors for info", () => {
    const result = colorPicker('info');
    assertEquals(result, {
      color: 'blue',
      textColor: 'white'
    });
  });
});

Deno.test("styleMap", async (t) => {
  await t.step("generates correct classes without extra permutations", () => {
    const result = styleMap('warn', false);
    assertEquals(result.outer, [
      'bg-yellow-200',
      'border-yellow-400',
      'text-black-800'
    ]);
    assertEquals(result.heading, [
      'bg-yellow-400',
      'text-black'
    ]);
  });

  await t.step("includes all permutations when requested", () => {
    const result = styleMap('warn', true);
    // Check it includes warn classes
    assertEquals(result.outer.includes('bg-yellow-200'), true);
    assertEquals(result.outer.includes('border-yellow-400'), true);
    // Check it includes other variants
    assertEquals(result.outer.includes('bg-blue-200'), true);
    assertEquals(result.outer.includes('bg-red-200'), true);
  });
});

Deno.test("variant validation", async (t) => {
  await t.step("throws on invalid variant", () => {
    assertThrows(
      () => styleMap('invalid'),
      Error,
      'Invalid variant "invalid", we only support info, warn, error'
    );
  });
});