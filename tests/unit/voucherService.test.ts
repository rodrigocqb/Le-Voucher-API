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
  it("should not apply discount for invalid voucher", async () => {
    const code = "aaa";
    const amount = 100;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce(undefined);

    const promise = voucherService.applyVoucher(code, amount);

    expect(promise).rejects.toEqual({
      message: "Voucher does not exist.",
      type: "conflict",
    });
  });

  it("should not apply discount for used vouchers", async () => {
    const code = "aaa";
    const discount = 10;
    const amount = 100;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ id: 1, code, discount, used: true });

    const order = await voucherService.applyVoucher(code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(discount);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  });

  it("should not apply discount for values below 100", async () => {
    const code = "aaa";
    const discount = 10;
    const amount = 99;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ id: 1, code, discount, used: false });

    const order = await voucherService.applyVoucher(code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(discount);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  });

  it("should apply discount for values equal to or above 100 with a valid voucher", async () => {
    const code = "aaa";
    const discount = 10;
    const amount = 100;

    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockResolvedValueOnce({ id: 1, code, discount, used: false });

    jest
      .spyOn(voucherRepository, "useVoucher")
      .mockImplementation((): any => {});

    const order = await voucherService.applyVoucher(code, amount);

    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(discount);
    expect(order.finalAmount).toBe(amount - amount * (discount / 100));
    expect(order.applied).toBe(true);
  });
});
