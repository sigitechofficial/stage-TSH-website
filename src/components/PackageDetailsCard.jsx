import React from 'react'

export default function PackageDetailsCard(props) {
  return (
    <div  className={`p-2 border ${props?.borderColor ? props?.borderColor:'border-borderColor'} ${props?.borderOpacity ? props?.borderOpacity:'border-opacity-100'} rounded-md`}>
    <div className="space-y-1 font-switzer text-themePlaceholder [&>p]:flex [&>p]:justify-between">
      <p className="text-sm">
        <span className="text-opacity-60 text-themePlaceholder">
          Company Name
        </span>{" "}
        <span>{props?.companyName}</span>
      </p>
      {/* <p className="text-sm">
        <span className="text-opacity-60 text-themePlaceholder">
          Trackign No
        </span>{" "}
      </p> */}
      <p className="text-sm flex flex-wrap  break-words break-all whitespace-normal">
        <span className="text-opacity-60 text-themePlaceholder">
          Name
        </span>{" "}
        <span>{props?.name}</span>
      </p>
      <p className="text-sm flex flex-wrap break-words break-all whitespace-normal">
        <span className="text-opacity-60 text-themePlaceholder">
          Email
        </span>{" "}
        <span className=''>{props?.email}</span>
      </p>
      <p className="text-sm flex flex-wrap  break-words break-all whitespace-normal">
        <span className="text-opacity-60 text-themePlaceholder">
          Phone#
        </span>{" "}
        <span>{props?.phoneNo}</span>
      </p>
      <p className="text-sm">
        <span className="text-opacity-60 text-themePlaceholder">
          ETA
        </span>{" "}
        <span>{props?.ETA}</span>
      </p>
    </div>
  </div>
  )
}
