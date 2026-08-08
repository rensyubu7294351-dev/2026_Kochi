import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom は scrollIntoView を持たないので、何もしない実装を入れておく
// （選択中のタブを画面内へ寄せる処理がテスト中にエラーにならないように）
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
