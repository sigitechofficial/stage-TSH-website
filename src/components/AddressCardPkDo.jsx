import React from "react";

export default function AddressCardPkDo(props) {
  return (
    <div className="ps-10 font-switzer text-themePlaceholder text-opacity-60 text-sm">
      <p>{props?.title}</p>
      <p>{props?.streetAddress}</p>
      <p>
        Building: {props?.building},
        Floor: {props?.floor}
      </p>
      <p>Apartment: {props?.apartment}</p>
      <p>
        {props?.district},{" "}
        {props?.city}
      </p>
      <p>
        {props?.province},{" "}
        {props?.country}
      </p>
      <p>
        Postal Code: {props?.postalCode}
      </p>
    </div>
  );
}
