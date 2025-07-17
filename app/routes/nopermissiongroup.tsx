const NoPermissionGroup = () => {
  return (
    <div className=" h-screen flex flex-col items-center justify-center text-center text-secondary w-full">
      <h1 className="text-4xlbold">
        You don't have permission to access this resource.
      </h1>
      <h3 className="text-2xl mt-4">
        {" "}
        Please use the following link to request access:
        <a
          href="https://jti.service-now.com/sp?id=index"
          className="text-2xl underline text-primary ml-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          request access
        </a>
      </h3>
    </div>
  )
}

export default NoPermissionGroup
