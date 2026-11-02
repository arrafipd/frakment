import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, StarIcon } from "@/lib/icons";

export function ItemDemo() {
  return (
    <div className="w-full max-w-sm">
      <ItemGroup>
        <Item variant="muted">
          <ItemMedia>
            <Avatar>
              <AvatarImage src="/avatars/female-l-1.avif" alt="@aria" />
              <AvatarFallback>{"AC"}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Aria Chen"}</ItemTitle>
            <ItemDescription>{"aria@frakment.dev"}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="secondary">{"Admin"}</Badge>
            <Button variant="ghost" size="icon-xs" aria-label="Open">
              <ChevronRightIcon />
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemMedia>
            <Avatar>
              <AvatarImage src="/avatars/male-l.avif" alt="@ben" />
              <AvatarFallback>{"BO"}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Ben Ortiz"}</ItemTitle>
            <ItemDescription>{"ben@frakment.dev"}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon-xs" aria-label="Favorite">
              <StarIcon />
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemMedia>
            <Avatar>
              <AvatarImage src="/avatars/female-l-2.avif" alt="@cleo" />
              <AvatarFallback>{"CP"}</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{"Cleo Park"}</ItemTitle>
            <ItemDescription>{"cleo@frakment.dev"}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="outline">{"Member"}</Badge>
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  );
}
