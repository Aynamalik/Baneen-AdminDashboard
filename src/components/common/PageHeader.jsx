const PageHeader = ({ title, subtitle, action, actionLabel }) => {
  return (
    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight m-0 mb-0.5">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-slate-500 m-0">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        typeof action === 'function'
          ? actionLabel && (
              <button
                type="button"
                onClick={action}
                className="btn-primary px-4 py-2 rounded-md text-sm shrink-0"
              >
                {actionLabel}
              </button>
            )
          : action
      )}
    </div>
  );
};

export default PageHeader;

