import { describe, it, expect, spyOn, afterEach } from "bun:test";
import { toPascalCase, toKebabCase, removeSuffix } from "../src/utils/formatting";
import { PathUtils } from "../src/utils/path.utils";

describe("CLI Utils", () => {
    describe("formatting", () => {
        it("toPascalCase should convert strings correctly", () => {
            expect(toPascalCase("hello-world")).toBe("HelloWorld");
            expect(toPascalCase("user_controller")).toBe("UserController");
            expect(toPascalCase("some name")).toBe("SomeName");
        });

        it("toKebabCase should convert strings correctly", () => {
            expect(toKebabCase("HelloWorld")).toBe("hello-world");
            expect(toKebabCase("UserController")).toBe("user-controller");
            expect(toKebabCase("Some Name")).toBe("some-name");
        });

        it("removeSuffix should remove suffix case-insensitively", () => {
            expect(removeSuffix("UserController", "Controller")).toBe("User");
            expect(removeSuffix("userservice", "Service")).toBe("user");
            expect(removeSuffix("User", "Controller")).toBe("User");
        });
    });

    describe("paths", () => {
        const existsSpy = spyOn(PathUtils, "exists");

        afterEach(() => {
            existsSpy.mockRestore();
        });

        it("findSrcDir should return src path if it exists", () => {
            existsSpy.mockReturnValue(true);
            const cwd = "/test/project";
            expect(PathUtils.findSrcDir(cwd)).toBe("/test/project/src");
        });

        it("findSrcDir should throw error if src does not exist", () => {
            existsSpy.mockReturnValue(false);
            const cwd = "/test/project";
            expect(() => PathUtils.findSrcDir(cwd)).toThrow("Could not find 'src' folder");
        });
    });
});
