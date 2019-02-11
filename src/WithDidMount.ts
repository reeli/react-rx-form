import { useLayoutEffect } from "react";

interface IWithDidMountProps {
  onDidMount: () => void;
}

export function WithDidMount(props: IWithDidMountProps) {
  useLayoutEffect(() => {
    props.onDidMount();
  }, []);

  return null;
}
