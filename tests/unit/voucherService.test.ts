import { jest } from "@jest/globals";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";

describe("createVoucher test suite", () => {
  jest
    .spyOn(voucherRepository, "createVoucher")
    .mockImplementation((): any => {});

  it("should not create voucher if code already exists", async () => {
    const voucher = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ ...voucher, used: false, id: 1 });

    const promise = voucherService.createVoucher(
      voucher.code,
      voucher.discount
    );

    expect(promise).rejects.toEqual({
      message: "Voucher already exist.",
      type: "conflict",
    });
  });

  it("should create voucher if there is no voucher with that code yet", async () => {
    const voucher = {
      code: "aaa",
      discount: 10,
    };

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(undefined);

    const promise = voucherService.createVoucher(
      voucher.code,
      voucher.discount
    );

    expect(promise).resolves.toBeUndefined();
  });
});

describe("applyVoucher test suite", () => {
    it("should not apply discount for invalid voucher")

    it("should not apply discount for values below 100")

    it("should apply discount for values above 100 with a valid voucher")
})
