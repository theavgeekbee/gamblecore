export default function WarningTooltip(props: {text: string}) {
    return <div className="tooltip">(!)
        <span className="warning">{props.text}</span>
    </div>;
}